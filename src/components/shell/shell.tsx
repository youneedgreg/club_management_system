"use client";

/**
 * Black Stars — responsive app shell. Ported from the prototype `App` chrome:
 * desktop sidebar, mobile top bar + bottom nav + "More" sheet, live pill,
 * search, notifications, user chip, theme/language switchers, and the AI FAB.
 */
import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { AiPanel } from "@/components/shell/ai-panel";
import { LangSwitch } from "@/components/shell/lang-switch";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { ToastProvider } from "@/components/shell/toast";
import { DATA } from "@/lib/data";
import { NAV, PRIMARY, badgeVal } from "@/lib/nav";

export function Shell({ children }: { children: ReactNode }) {
  const { t } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const [ai, setAi] = useState(false);
  const [sheet, setSheet] = useState(false);

  const view = pathname.split("/")[1] || "dashboard";

  // Persist last view (for the root redirect) + reset scroll on navigation.
  useEffect(() => {
    try {
      localStorage.setItem("bs_view", pathname);
    } catch {
      /* ignore */
    }
    const m = document.querySelector(".main");
    if (m) m.scrollTop = 0;
  }, [pathname]);

  const go = (href: string) => {
    setSheet(false);
    router.push(href);
  };

  const subtitle =
    view === "dashboard" ? `${DATA.meta.night} · ${DATA.meta.tagline}` : DATA.meta.location;

  return (
    <ToastProvider>
      <div className="app">
        {/* Sidebar (desktop / tablet) */}
        <aside className="sidebar">
          <div className="brand">
            <span className="logo">
              <Icon.star style={{ width: 22, height: 22, color: "var(--gold)" }} />
            </span>
            <div className="nm-wrap">
              <div className="nm">{DATA.meta.club}</div>
              <div className="sub">{DATA.meta.tagline}</div>
            </div>
          </div>
          <nav className="navlist">
            {NAV.map((n) => {
              const I = Icon[n.ic];
              const b = badgeVal(n.badge);
              const on = view === n.k;
              return (
                <Link
                  key={n.k}
                  href={n.href}
                  className={"navitem " + (on ? "on" : "")}
                  title={t(n.k)}
                  onClick={() => setSheet(false)}
                >
                  <I />
                  <span>{t(n.k)}</span>
                  {b > 0 && <span className="badge-n">{b}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="foot">
            <button className="userchip">
              <span className="avatar">D</span>
              <div className="uc-txt">
                <div style={{ fontSize: 13, fontWeight: 600 }}>{DATA.meta.owner}</div>
                <div style={{ fontSize: 11, color: "var(--faint)" }}>{t("account")}</div>
              </div>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {/* Mobile top bar */}
          <div className="mobile-top">
            <span
              className="logo"
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                display: "grid",
                placeItems: "center",
                background: "radial-gradient(120% 120% at 30% 20%, #2a2a32, #111114)",
                border: "1px solid var(--gold-line)",
              }}
            >
              <Icon.star style={{ width: 18, height: 18, color: "var(--gold)" }} />
            </span>
            <div className="gr" style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 15 }}>
                {t(view)}
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                {DATA.meta.club}
              </div>
            </div>
            <ThemeToggle />
            <LangSwitch />
          </div>

          {/* Desktop top bar */}
          <div className="topbar">
            <div className="topbar-in">
              <div>
                <div className="page-h1">{t(view)}</div>
                <div className="page-sub">{subtitle}</div>
              </div>
              <div className="spacer" />
              <div className="live-pill">
                <span className="live-dot" /> {t("openNow")} · {DATA.meta.close}
              </div>
              <div className="searchbox">
                <Icon.search />
                <input placeholder={t("search")} />
              </div>
              <ThemeToggle />
              <LangSwitch />
              <button className="iconbtn">
                <Icon.bell />
                <span className="dot" />
              </button>
            </div>
          </div>

          <div className="canvas">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="bottomnav">
          {PRIMARY.map((k) => {
            const n = NAV.find((x) => x.k === k)!;
            const I = Icon[n.ic];
            const b = badgeVal(n.badge);
            return (
              <Link
                key={k}
                href={n.href}
                className={"bnav " + (view === k ? "on" : "")}
                onClick={() => setSheet(false)}
              >
                <I />
                {b > 0 && <span className="badge-n">{b}</span>}
                <span>{t(k)}</span>
              </Link>
            );
          })}
          <button
            className={"bnav " + (!PRIMARY.includes(view) ? "on" : "")}
            onClick={() => setSheet(true)}
          >
            <Icon.more />
            <span>{t("more")}</span>
          </button>
        </nav>

        {/* More sheet */}
        {sheet && (
          <Fragment>
            <div className="scrim" style={{ zIndex: 94 }} onClick={() => setSheet(false)} />
            <div className="sheet">
              <div className="grab" />
              <div className="sheet-grid">
                {NAV.filter((n) => !PRIMARY.includes(n.k)).map((n) => {
                  const I = Icon[n.ic];
                  return (
                    <button
                      key={n.k}
                      className={"sheet-item " + (view === n.k ? "on" : "")}
                      onClick={() => go(n.href)}
                    >
                      <I />
                      <span>{t(n.k)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Fragment>
        )}

        {/* AI FAB + panel */}
        <div className="fab">
          <button className="fab-btn" onClick={() => setAi(true)}>
            <Icon.sparkles />
            <span>{t("aiAssistant")}</span>
          </button>
        </div>
        {ai && <AiPanel onClose={() => setAi(false)} />}
      </div>
    </ToastProvider>
  );
}
