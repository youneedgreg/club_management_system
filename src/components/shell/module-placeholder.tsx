"use client";

/**
 * Styled placeholder for modules not yet built. Keeps the shell navigable and
 * on-brand while later phases fill in each screen.
 */
import { IcChip, Page } from "@/components/bs";
import { Icon, type IconName } from "@/components/icons";
import { useT } from "@/components/providers";

export function ModulePlaceholder({
  titleKey,
  icon,
  color = "var(--gold)",
  phase,
}: {
  titleKey: string;
  icon: IconName;
  color?: string;
  phase: number;
}) {
  const { t } = useT();
  return (
    <Page>
      <div
        className="card card-pad"
        style={{
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: "64px 24px",
          gap: 4,
        }}
      >
        <IcChip name={icon} color={color} size={64} r={20} />
        <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 22, marginTop: 16 }}>
          {t(titleKey)}
        </div>
        <div
          className="muted"
          style={{ fontSize: 13.5, maxWidth: 380, lineHeight: 1.55, marginTop: 4 }}
        >
          This module is part of the Black Stars build plan and ships in Phase {phase}. The design
          system, navigation, theming and language switching are live now.
        </div>
        <span className="chip gold" style={{ marginTop: 16 }}>
          <Icon.sparkles style={{ width: 13, height: 13 }} /> Phase {phase}
        </span>
      </div>
    </Page>
  );
}
