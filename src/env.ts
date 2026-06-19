import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Typed, validated environment configuration for Black Stars.
 *
 * Keys are grouped by the integration they belong to and mirror `.env.example`.
 * Integration keys are `.optional()` for now so the app builds before each
 * service is wired up; tighten them to required as the relevant phase lands
 * (see the "Required in" notes and `SERVICES_AND_COSTS.md`).
 *
 * Set `SKIP_ENV_VALIDATION=1` to bypass validation (e.g. in CI lint-only jobs).
 */
export const env = createEnv({
  /**
   * Server-only secrets. Never exposed to the browser.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // --- Database: Neon Postgres (Phase 3) ---
    DATABASE_URL: z.string().url().optional(),

    // --- Auth: Neon Auth / Stack Auth (Phase 4) ---
    STACK_SECRET_SERVER_KEY: z.string().min(1).optional(),

    // --- Email: Resend (Phase 16) ---
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),

    // --- Notifications: Twilio (Phase 16) ---
    TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
    TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
    TWILIO_SMS_FROM: z.string().min(1).optional(),
    TWILIO_WHATSAPP_FROM: z.string().min(1).optional(),

    // --- AI: Claude / Anthropic (Phase 18) ---
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_DEFAULT_MODEL: z.string().min(1).default("claude-haiku-4-5-20251001"),

    // --- Payments: M-Pesa Daraja (Phase 17) ---
    MPESA_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
    MPESA_CONSUMER_KEY: z.string().min(1).optional(),
    MPESA_CONSUMER_SECRET: z.string().min(1).optional(),
    MPESA_SHORTCODE: z.string().min(1).optional(),
    MPESA_PASSKEY: z.string().min(1).optional(),
    MPESA_CALLBACK_URL: z.string().url().optional(),
  },

  /**
   * Client-exposed values. Must be prefixed with `NEXT_PUBLIC_`.
   */
  client: {
    // --- Auth: Neon Auth / Stack Auth (Phase 4) ---
    NEXT_PUBLIC_STACK_PROJECT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().min(1).optional(),

    // --- App ---
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  /**
   * Destructure manually for Next.js edge/runtime compatibility.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_SMS_FROM: process.env.TWILIO_SMS_FROM,
    TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_DEFAULT_MODEL: process.env.ANTHROPIC_DEFAULT_MODEL,
    MPESA_ENVIRONMENT: process.env.MPESA_ENVIRONMENT,
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE: process.env.MPESA_SHORTCODE,
    MPESA_PASSKEY: process.env.MPESA_PASSKEY,
    MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL,
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Treat empty strings as undefined so a blank `.env` entry fails `.min(1)`
   * instead of silently passing.
   */
  emptyStringAsUndefined: true,

  /**
   * Skip validation when explicitly requested (e.g. lint-only CI steps).
   */
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
