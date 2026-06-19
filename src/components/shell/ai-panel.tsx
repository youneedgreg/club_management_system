"use client";

/**
 * Black Stars AI assistant — slide-over panel with suggested questions.
 * Ported from the prototype `AIPanel`; answers are illustrative mock-ups.
 * Phase 18 replaces these with real Claude API calls grounded in live data.
 */
import { Fragment, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { DATA } from "@/lib/data";
import { money } from "@/lib/format";

interface Msg {
  who: "ai" | "me";
  text: string;
}

export function AiPanel({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  const owed = DATA.credit.reduce((s, c) => s + c.bal, 0);
  const weekRev = DATA.weekly.reduce((s, d) => s + d.rev, 0);
  const weekCost = DATA.weekly.reduce((s, d) => s + d.cost, 0);
  const cur = DATA.meta.currency;

  const ANS: Record<string, string> = {
    q1: `M-Pesa brought in ${cur} ${money(DATA.paymentMix[0].v)} tonight — ${DATA.paymentMix[0].pct}% of gross. Cash ${cur} ${money(DATA.paymentMix[1].v)}, card ${cur} ${money(DATA.paymentMix[2].v)}.`,
    q2: `Running low: Hennessy VS (2/6), Jameson (3/10), Heineken (3/15) and White Cap (4/15). I'd reorder from EABL before the weekend rush.`,
    q3: `${DATA.credit.length} customers owe you ${cur} ${money(owed)}. Biggest is Wachira Holdings at ${cur} 120,000 — 12 days overdue.`,
    q4: `This week: revenue ${cur} ${money(weekRev)}, costs ${cur} ${money(weekCost)} → profit ${cur} ${money(weekRev - weekCost)}. Margin ${Math.round(((weekRev - weekCost) / weekRev) * 100)}%. Yes — solidly profitable.`,
  };

  const [msgs, setMsgs] = useState<Msg[]>([
    { who: "ai", text: `${t("greeting")} 👋 ${t("aiSubtitle")}.` },
  ]);
  const [asked, setAsked] = useState<string[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  const ask = (q: string) => {
    setMsgs((m) => [...m, { who: "me", text: t(q) }, { who: "ai", text: ANS[q] }]);
    setAsked((a) => [...a, q]);
  };

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs]);

  const remaining = ["q1", "q2", "q3", "q4"].filter((q) => !asked.includes(q));

  return (
    <Fragment>
      <div className="scrim" onClick={onClose} />
      <div className="ai-panel">
        <div className="ai-head">
          <span
            className="ic"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg,var(--gold-2),var(--gold))",
              color: "#1b1302",
            }}
          >
            <Icon.sparkles style={{ width: 20, height: 20 }} />
          </span>
          <div className="gr" style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 15 }}>
              {t("aiTitle")}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              <span className="live-dot" style={{ display: "inline-block", marginInlineEnd: 5 }} />
              {t("aiSubtitle")}
            </div>
          </div>
          <button className="iconbtn" onClick={onClose} style={{ width: 34, height: 34 }}>
            <Icon.close />
          </button>
        </div>
        <div className="ai-body" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div key={i} className={"bubble " + m.who}>
              {m.text}
            </div>
          ))}
          {remaining.length > 0 && (
            <div className="stack" style={{ gap: 8, marginTop: 4 }}>
              <div className="eyebrow" style={{ marginInlineStart: 2 }}>
                {t("aiHint")}
              </div>
              {remaining.map((q) => (
                <button key={q} className="suggest" onClick={() => ask(q)}>
                  <Icon.sparkles /> {t(q)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ai-foot">
          <div className="ai-input">
            <input
              placeholder={t("aiPlaceholder")}
              onKeyDown={(e) => {
                const target = e.target as HTMLInputElement;
                if (e.key === "Enter" && target.value.trim()) {
                  setMsgs((m) => [
                    ...m,
                    { who: "me", text: target.value },
                    { who: "ai", text: t("aiDisclaimer") },
                  ]);
                  target.value = "";
                }
              }}
            />
            <button className="send">
              <Icon.send />
            </button>
          </div>
          <div className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: 9 }}>
            {t("aiDisclaimer")}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
