/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as candidates from "../candidates.js";
import type * as chat from "../chat.js";
import type * as gemini from "../gemini.js";
import type * as internalFunctions from "../internalFunctions.js";
import type * as jobs from "../jobs.js";
import type * as questions from "../questions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  candidates: typeof candidates;
  chat: typeof chat;
  gemini: typeof gemini;
  internalFunctions: typeof internalFunctions;
  jobs: typeof jobs;
  questions: typeof questions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
