import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .take(100);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const get = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return await ctx.db.query("events").order("desc").take(200);
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    eventDate: v.number(),
    location: v.optional(v.string()),
    isFree: v.boolean(),
    stripePriceId: v.optional(v.string()),
    priceAmountCents: v.optional(v.number()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("Slug already in use");
    return await ctx.db.insert("events", {
      ...args,
      isArchived: false,
      mediaCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    eventId: v.id("events"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    location: v.optional(v.string()),
    isFree: v.optional(v.boolean()),
    stripePriceId: v.optional(v.string()),
    priceAmountCents: v.optional(v.number()),
    coverImageUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const { eventId, ...fields } = args;
    await ctx.db.patch(eventId, fields);
  },
});

export const incrementMediaCount = internalMutation({
  args: { eventId: v.id("events"), delta: v.number() },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return;
    await ctx.db.patch(args.eventId, {
      mediaCount: event.mediaCount + args.delta,
    });
  },
});
