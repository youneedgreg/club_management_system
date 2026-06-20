import type { ReactNode } from "react";

import { Shell } from "@/components/shell/shell";
import { isAuthConfigured } from "@/lib/auth/server";
import { requireMembership } from "@/lib/auth/session";
import { getDefaultClubId, lowStockCount } from "@/server/services";

// Session reads depend on cookies — required by the Neon Auth server SDK.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Before Neon Auth is provisioned, render the app unauthenticated (dev mode).
  if (!isAuthConfigured) {
    const low = await lowStockCount(await getDefaultClubId());
    return <Shell badges={{ low }}>{children}</Shell>;
  }

  const { user, clubId, role } = await requireMembership();
  const low = await lowStockCount(clubId);
  return (
    <Shell session={{ name: user.name, email: user.email, role }} badges={{ low }}>
      {children}
    </Shell>
  );
}
