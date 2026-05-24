import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    eventDate: v.number(),
    location: v.optional(v.string()),
    isFree: v.boolean(),
    stripePriceId: v.optional(v.string()),
    priceAmountCents: v.optional(v.number()),
    coverImageUrl: v.optional(v.string()),
    isPublished: v.boolean(),
    isArchived: v.boolean(),
    mediaCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["isPublished"]),

  mediaAssets: defineTable({
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
    isPublished: v.boolean(),
  })
    .index("by_event", ["eventId"])
    .index("by_event_and_order", ["eventId", "sortOrder"]),

  accessCodes: defineTable({
    eventId: v.id("events"),
    code: v.string(),
    label: v.optional(v.string()),
    isRevoked: v.boolean(),
    usageCount: v.number(),
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_event", ["eventId"]),

  purchases: defineTable({
    eventId: v.id("events"),
    stripePaymentIntentId: v.string(),
    stripeCheckoutSessionId: v.string(),
    buyerEmail: v.string(),
    accessCodeId: v.id("accessCodes"),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("refunded"),
    ),
    amountCents: v.number(),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_payment_intent", ["stripePaymentIntentId"])
    .index("by_session", ["stripeCheckoutSessionId"]),
});
