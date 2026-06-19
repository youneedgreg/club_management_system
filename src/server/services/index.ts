/**
 * Data-access layer (repositories + aggregation helpers) for Black Stars.
 *
 * Framework-agnostic by design (no React/Next imports) so the logic stays
 * unit-testable and reusable by CLI scripts. Server Components and Server
 * Actions import from here; pure math lives in `./calc`.
 */
export * as calc from "./calc";
export * from "./period";
export * from "./club";
export * from "./income";
export * from "./sales";
export * from "./expenses";
export * from "./inventory";
export * from "./suppliers";
export * from "./credit";
export * from "./kitchen";
export * from "./staff";
export * from "./lineup";
export * from "./reports";
