import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export const fulfillPayment = internalMutation({
  args: {
    eventId: v.id("events"),
    stripePaymentIntentId: v.string(),
    stripeCheckoutSessionId: v.string(),
    buyerEmail: v.string(),
    amountCents: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId),
      )
      .unique();
    if (existing) return existing._id;

    const code = generateCode();
    const codeId = await ctx.db.insert("accessCodes", {
      eventId: args.eventId,
      code,
      label: `Purchased by ${args.buyerEmail}`,
      isRevoked: false,
      usageCount: 0,
      maxUses: undefined,
      expiresAt: undefined,
    });

    return await ctx.db.insert("purchases", {
      eventId: args.eventId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      buyerEmail: args.buyerEmail,
      accessCodeId: codeId,
      status: "complete",
      amountCents: args.amountCents,
      createdAt: Date.now(),
    });
  },
});

export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_session", (q) => q.eq("stripeCheckoutSessionId", args.sessionId))
      .unique();
    if (!purchase) return null;
    const code = await ctx.db.get(purchase.accessCodeId);
    return { purchase, code };
  },
});

export const getRevenueSummary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const purchases = await ctx.db.query("purchases").order("desc").take(100);
    const totalCents = purchases
      .filter((p) => p.status === "complete")
      .reduce((sum, p) => sum + p.amountCents, 0);
    return { totalCents, purchases };
  },
});
