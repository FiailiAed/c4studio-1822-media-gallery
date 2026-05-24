"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { UTApi } from "uploadthing/server";

export const deleteFile = internalAction({
  args: { uploadthingKey: v.string() },
  handler: async (_ctx, args) => {
    const utapi = new UTApi();
    await utapi.deleteFiles(args.uploadthingKey);
  },
});
