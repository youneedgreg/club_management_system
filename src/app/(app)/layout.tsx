import type { ReactNode } from "react";

import { Shell } from "@/components/shell/shell";
import { isAuthConfigured } from "@/lib/auth/server";
import { requireMembership } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Before Neon Auth is provisioned, render the app unauthenticated (dev mode).
  if (!isAuthConfigured) return <Shell>{children}</Shell>;

  const { user, role } = await requireMembership();
  return <Shell session={{ name: user.name, email: user.email, role }}>{children}</Shell>;
}
