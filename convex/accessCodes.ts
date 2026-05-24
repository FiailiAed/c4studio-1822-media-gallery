import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export const check = query({
  args: { code: v.string(), eventId: v.id("events") },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("accessCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();
    if (!record) return { valid: false };
    if (record.eventId !== args.eventId) return { valid: false };
    if (record.isRevoked) return { valid: false };
    if (record.expiresAt && record.expiresAt < Date.now()) return { valid: false };
    if (record.maxUses !== undefined && record.usageCount >= record.maxUses) return { valid: false };
    return { valid: true };
  },
});

export const redeemCode = mutation({
  args: { code: v.string(), eventId: v.id("events") },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("accessCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();
    if (!record) throw new Error("invalid_code");
    if (record.eventId !== args.eventId) throw new Error("invalid_code");
    if (record.isRevoked) throw new Error("revoked");
    if (record.expiresAt && record.expiresAt < Date.now()) throw new Error("expired");
    if (record.maxUses !== undefined && record.usageCount >= record.maxUses) throw new Error("max_uses");
    await ctx.db.patch(record._id, { usageCount: record.usageCount + 1 });
    return { success: true };
  },
});

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return await ctx.db
      .query("accessCodes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .take(100);
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    code: v.optional(v.string()),
    label: v.optional(v.string()),
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const code = args.code?.toUpperCase() ?? generateCode();
    const existing = await ctx.db
      .query("accessCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (existing) throw new Error("Code already exists");
    return await ctx.db.insert("accessCodes", {
      eventId: args.eventId,
      code,
      label: args.label,
      isRevoked: false,
      usageCount: 0,
      maxUses: args.maxUses,
      expiresAt: args.expiresAt,
    });
  },
});

export const revoke = mutation({
  args: { codeId: v.id("accessCodes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await ctx.db.patch(args.codeId, { isRevoked: true });
  },
});
