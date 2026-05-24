/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessCodes from "../accessCodes.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as media from "../media.js";
import type * as payments from "../payments.js";
import type * as payments_internal from "../payments_internal.js";
import type * as purchases from "../purchases.js";
import type * as uploadthing from "../uploadthing.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessCodes: typeof accessCodes;
  events: typeof events;
  http: typeof http;
  media: typeof media;
  payments: typeof payments;
  payments_internal: typeof payments_internal;
  purchases: typeof purchases;
  uploadthing: typeof uploadthing;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  stripe: import("@convex-dev/stripe/_generated/component.js").ComponentApi<"stripe">;
};
