/**
 * Schema barrel. Re-exports every table, enum and relation so the Drizzle
 * client (`drizzle({ schema })`), drizzle-kit and the repositories share one
 * source of truth.
 */
export * from "./enums";
export * from "./clubs";
export * from "./categories";
export * from "./suppliers";
export * from "./inventory";
export * from "./sales";
export * from "./expenses";
export * from "./kitchen";
export * from "./credit";
export * from "./staff";
export * from "./lineup";
export * from "./reporting";
export * from "./relations";
