import { auth } from "@/lib/auth/server";

/**
 * Neon Auth API proxy. The browser client talks to these routes, which forward
 * to the Neon Auth server. The catch-all segment is named `path` to match the
 * handler's expected params shape.
 *
 * Returns 503 until Neon Auth is configured (env keys absent).
 */
const notConfigured = () => new Response("Neon Auth is not configured.", { status: 503 });

const handlers = auth?.handler();

export const GET = handlers?.GET ?? notConfigured;
export const POST = handlers?.POST ?? notConfigured;
