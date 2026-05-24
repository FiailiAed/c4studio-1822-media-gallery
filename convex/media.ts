import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mediaAssets")
      .withIndex("by_event_and_order", (q) => q.eq("eventId", args.eventId))
      .order("asc")
      .take(200);
  },
});

export const listWatermarkedPreviews = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("mediaAssets")
      .withIndex("by_event_and_order", (q) => q.eq("eventId", args.eventId))
      .order("asc")
      .take(12);
    return assets.map((a) => ({
      _id: a._id,
      watermarkedUrl: a.watermarkedUrl ?? a.uploadthingUrl,
      width: a.width,
      height: a.height,
      mimeType: a.mimeType,
    }));
  },
});

export const registerUpload = mutation({
  args: {
    eventId: v.id("events"),
    uploadthingKey: v.string(),
    uploadthingUrl: v.string(),
    watermarkedUrl: v.optional(v.string()),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const id = await ctx.db.insert("mediaAssets", {
      ...args,
      isPublished: true,
    });
    await ctx.runMutation(internal.events.incrementMediaCount, {
      eventId: args.eventId,
      delta: 1,
    });
    return id;
  },
});

export const deleteAsset = mutation({
  args: { assetId: v.id("mediaAssets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const asset = await ctx.db.get(args.assetId);
    if (!asset) throw new Error("Asset not found");
    await ctx.db.delete(args.assetId);
    await ctx.runMutation(internal.events.incrementMediaCount, {
      eventId: asset.eventId,
      delta: -1,
    });
    return asset.uploadthingKey;
  },
});
