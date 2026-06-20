"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { authClient } from "@/lib/auth/client";

/** Shown to a signed-in user who isn't a member of the club (pending invite). */
export default function NoAccessPage() {
  const { t } = useT();
  const router = useRouter();

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch {
      /* ignore */
    }
    router.push("/auth/sign-in");
    router.refresh();
  };

  return (
    <div className="card card-pad" style={{ display: "grid", gap: 14, textAlign: "center" }}>
      <div style={{ display: "grid", placeItems: "center" }}>
        <span
          className="logo"
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            background: "radial-gradient(120% 120% at 30% 20%, #2a2a32, #111114)",
            border: "1px solid var(--gold-line)",
          }}
        >
          <Icon.shield style={{ width: 22, height: 22, color: "var(--gold)" }} />
        </span>
      </div>
      <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 18 }}>
        {t("noAccessTitle")}
      </div>
      <div className="muted" style={{ fontSize: 13 }}>
        {t("noAccessBody")}
      </div>
      <button className="btn ghost" type="button" onClick={signOut}>
        {t("signOut")}
      </button>
    </div>
  );
}
