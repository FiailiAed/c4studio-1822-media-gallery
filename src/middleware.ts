import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const onRequest = clerkMiddleware((auth, context, next) => {
  if (isAdminRoute(context.request) && !auth().userId) {
    return context.redirect("/sign-in");
  }
  return next();
});
