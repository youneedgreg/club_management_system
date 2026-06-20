"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import type { MemberRole } from "@/lib/auth/roles";
import { authClient } from "@/lib/auth/client";
import { DATA } from "@/lib/data";
import { initials } from "@/lib/format";

export interface ChipSession {
  name: string | null;
  email: string | null;
  role: MemberRole;
}

/**
 * Sidebar account chip. Shows the signed-in user + role with a sign-out action.
 * Falls back to the static club owner label when auth isn't configured yet.
 */
export function AccountChip({ session }: { session?: ChipSession }) {
  const { t } = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const display = session?.name || session?.email || DATA.meta.owner;
  const sub = session ? t(session.role) : t("account");

  const signOut = async () => {
    setBusy(true);
    try {
      await authClient.signOut();
    } catch {
      /* ignore — redirect regardless */
    }
    router.push("/auth/sign-in");
    router.refresh();
  };

  return (
    <div className="userchip" style={{ gap: 10 }}>
      <span className="avatar">{initials(display)}</span>
      <div className="uc-txt" style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {display}
        </div>
        <div style={{ fontSize: 11, color: "var(--faint)" }}>{sub}</div>
      </div>
      {session && (
        <button
          className="iconbtn"
          onClick={signOut}
          disabled={busy}
          title={t("signOut")}
          aria-label={t("signOut")}
        >
          <Icon.logout />
        </button>
      )}
    </div>
  );
}
