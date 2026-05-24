import { ConvexClient } from "convex/browser";

export const convex = new ConvexClient(import.meta.env.PUBLIC_CONVEX_URL as string);
