import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const onRequest = clerkMiddleware((auth, context, next) => {
  if (isAdminRoute(context.request) && !auth().userId) {
    const signInUrl = new URL("/sign-in", context.request.url);
    signInUrl.searchParams.set("redirect_url", context.request.url);
    return context.redirect(signInUrl.toString());
  }
  return next();
});
