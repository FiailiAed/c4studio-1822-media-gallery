"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Stripe from "stripe";

export const createCheckout = action({
  args: {
    eventId: v.id("events"),
    buyerEmail: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });

    const event = await ctx.runQuery(internal.payments_internal.getEvent, {
      eventId: args.eventId,
    });
    if (!event || event.isFree || !event.stripePriceId) {
      throw new Error("Event is not purchasable");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: event.stripePriceId, quantity: 1 }],
      customer_email: args.buyerEmail,
      success_url: args.successUrl + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: args.cancelUrl,
      metadata: {
        eventId: args.eventId,
        buyerEmail: args.buyerEmail,
      },
    });

    if (!session.url) throw new Error("No checkout URL returned from Stripe");
    return { url: session.url };
  },
});
