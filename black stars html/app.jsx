/* Black Stars — App shell: i18n provider, responsive nav, language switch, AI panel, routing */
const { useState: uS, useEffect: uE, useRef: uR } = React;

const NAV = [
  { k: "dashboard", ic: "dashboard" },
  { k: "stock", ic: "stock", badge: "low" },
  { k: "income", ic: "income" },
  { k: "expenses", ic: "expenses" },
  { k: "kitchen", ic: "pot" },
  { k: "lineup", ic: "calendar" },
  { k: "credit", ic: "credit", badge: "overdue" },
  { k: "payables", ic: "banknote" },
  { k: "staff", ic: "staff" },
  { k: "reports", ic: "reports" },
  { k: "settings", ic: "settings" },
];
const PRIMARY = ["dashboard", "stock", "income", "expenses"];
const MODULES = { dashboard: Dashboard, stock: BarStock, income: Income, expenses: Expenses, kitchen: Kitchen, lineup: Lineup, credit: Credit, payables: Suppliers, staff: Staff, reports: Reports, settings: Settings };

const lowCount = DATA.stock.filter(s => s.onHand < s.par).length;
const overdueCount = DATA.credit.filter(c => c.age > 7).length;
const badgeVal = (b) => b === "low" ? lowCount : b === "overdue" ? overdueCount : 0;

/* ---------- Language switcher ---------- */
function LangSwitch() {
  const { lang, setLang } = useT();
  const [open, setOpen] = uS(false);
  const ref = uR();
  uE(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="lang-wrap" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen(o => !o)}>
        <Icon.globe className="glb" />
        <span>{I18N[lang]._native}</span>
        <Icon.chevDown className="car" />
      </button>
      {open && (
        <div className="lang-menu">
          {["en", "fr", "ar"].map(l => (
            <button key={l} className={"lang-opt " + (lang === l ? "on" : "")} onClick={() => { setLang(l); setOpen(false); }}>
              <span className="fl">{I18N[l]._flag}</span>
              <span><div className="nat">{I18N[l]._native}</div><div className="en">{I18N[l]._name}</div></span>
              {lang === l && <Icon.check className="ck" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- AI panel (mockup with illustrative answers) ---------- */
function AIPanel({ onClose }) {
  const { t } = useT();
  const income = DATA.byHour.reduce((s, d) => s + d.v, 0);
  const owed = DATA.credit.reduce((s, c) => s + c.bal, 0);
  const weekRev = DATA.weekly.reduce((s, d) => s + d.rev, 0);
  const weekCost = DATA.weekly.reduce((s, d) => s + d.cost, 0);
  const cur = DATA.meta.currency;
  const ANS = {
    q1: `M-Pesa brought in ${cur} ${money(DATA.paymentMix[0].v)} tonight — ${DATA.paymentMix[0].pct}% of gross. Cash ${cur} ${money(DATA.paymentMix[1].v)}, card ${cur} ${money(DATA.paymentMix[2].v)}.`,
    q2: `Running low: Hennessy VS (2/6), Jameson (3/10), Heineken (3/15) and White Cap (4/15). I'd reorder from EABL before the weekend rush.`,
    q3: `${DATA.credit.length} customers owe you ${cur} ${money(owed)}. Biggest is Wachira Holdings at ${cur} 120,000 — 12 days overdue.`,
    q4: `This week: revenue ${cur} ${money(weekRev)}, costs ${cur} ${money(weekCost)} → profit ${cur} ${money(weekRev - weekCost)}. Margin ${Math.round((weekRev - weekCost) / weekRev * 100)}%. Yes — solidly profitable.`,
  };
  const [msgs, setMsgs] = uS([{ who: "ai", text: `${t("greeting")} 👋 ${t("aiSubtitle")}.` }]);
  const [asked, setAsked] = uS([]);
  const bodyRef = uR();
  const ask = (q) => {
    setMsgs(m => [...m, { who: "me", text: t(q) }, { who: "ai", text: ANS[q] }]);
    setAsked(a => [...a, q]);
  };
  uE(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs]);
  const remaining = ["q1", "q2", "q3", "q4"].filter(q => !asked.includes(q));

  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose} />
      <div className="ai-panel">
        <div className="ai-head">
          <span className="ic" style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(135deg,var(--gold-2),var(--gold))", color: "#1b1302" }}><Icon.sparkles style={{ width: 20, height: 20 }} /></span>
          <div className="gr" style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 15 }}>{t("aiTitle")}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}><span className="live-dot" style={{ display: "inline-block", marginInlineEnd: 5 }} />{t("aiSubtitle")}</div>
          </div>
          <button className="iconbtn" onClick={onClose} style={{ width: 34, height: 34 }}><Icon.close /></button>
        </div>
        <div className="ai-body" ref={bodyRef}>
          {msgs.map((m, i) => <div key={i} className={"bubble " + m.who}>{m.text}</div>)}
          {remaining.length > 0 && (
            <div className="stack" style={{ gap: 8, marginTop: 4 }}>
              <div className="eyebrow" style={{ marginInlineStart: 2 }}>{t("aiHint")}</div>
              {remaining.map(q => (
                <button key={q} className="suggest" onClick={() => ask(q)}><Icon.sparkles /> {t(q)}</button>
              ))}
            </div>
          )}
        </div>
        <div className="ai-foot">
          <div className="ai-input">
            <input placeholder={t("aiPlaceholder")} onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) { setMsgs(m => [...m, { who: "me", text: e.target.value }, { who: "ai", text: t("aiDisclaimer") }]); e.target.value = ""; } }} />
            <button className="send"><Icon.send /></button>
          </div>
          <div className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: 9 }}>{t("aiDisclaimer")}</div>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---------- Theme toggle ---------- */
function ThemeToggle() {
  const { theme, setTheme } = useT();
  const dark = theme !== "light";
  return <button className="iconbtn" title={dark ? "Light" : "Dark"} onClick={() => setTheme(dark ? "light" : "dark")}>{dark ? <Icon.sun /> : <Icon.moon />}</button>;
}

/* ---------- App ---------- */
function App() {
  const [lang, setLangState] = uS(() => localStorage.getItem("bs_lang") || "en");
  const [theme, setThemeState] = uS(() => localStorage.getItem("bs_theme") || "dark");
  const [view, setView] = uS(() => localStorage.getItem("bs_view") || "dashboard");
  const [ai, setAi] = uS(false);
  const [sheet, setSheet] = uS(false);
  const [toastMsg, setToastMsg] = uS(null);
  const toastTimer = uR();

  const setLang = (l) => { setLangState(l); localStorage.setItem("bs_lang", l); };
  const setTheme = (th) => { setThemeState(th); localStorage.setItem("bs_theme", th); };
  const go = (v) => { setView(v); setSheet(false); localStorage.setItem("bs_view", v); window.scrollTo?.(0, 0); const m = document.querySelector(".main"); if (m) m.scrollTop = 0; };
  const toast = (msg) => { setToastMsg(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToastMsg(null), 2200); };

  uE(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = I18N[lang]._dir;
  }, [lang]);
  uE(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;
  const dir = I18N[lang]._dir;
  const Active = MODULES[view];
  const subtitle = view === "dashboard" ? `${DATA.meta.night} · ${DATA.meta.tagline}` : DATA.meta.location;

  return (
    <I18nContext.Provider value={{ t, lang, setLang, dir, theme, setTheme }}>
      <div className="app">
        {/* Sidebar (desktop / tablet) */}
        <aside className="sidebar">
          <div className="brand">
            <span className="logo"><Icon.star style={{ width: 22, height: 22, color: "var(--gold)" }} /></span>
            <div className="nm-wrap"><div className="nm">{DATA.meta.club}</div><div className="sub">{DATA.meta.tagline}</div></div>
          </div>
          <nav className="navlist">
            {NAV.map(n => {
              const I = Icon[n.ic]; const b = badgeVal(n.badge);
              return (
                <button key={n.k} className={"navitem " + (view === n.k ? "on" : "")} onClick={() => go(n.k)} title={t(n.k)}>
                  <I /><span>{t(n.k)}</span>{b > 0 && <span className="badge-n">{b}</span>}
                </button>
              );
            })}
          </nav>
          <div className="foot">
            <button className="userchip">
              <span className="avatar">D</span>
              <div className="uc-txt"><div style={{ fontSize: 13, fontWeight: 600 }}>{DATA.meta.owner}</div><div style={{ fontSize: 11, color: "var(--faint)" }}>{t("account")}</div></div>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {/* Mobile top bar */}
          <div className="mobile-top">
            <span className="logo" style={{ width: 36, height: 36, borderRadius: 11, display: "grid", placeItems: "center", background: "radial-gradient(120% 120% at 30% 20%, #2a2a32, #111114)", border: "1px solid var(--gold-line)" }}><Icon.star style={{ width: 18, height: 18, color: "var(--gold)" }} /></span>
            <div className="gr" style={{ flex: 1 }}><div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 15 }}>{t(view)}</div><div className="muted" style={{ fontSize: 11 }}>{DATA.meta.club}</div></div>
            <ThemeToggle />
            <LangSwitch />
          </div>

          {/* Desktop top bar */}
          <div className="topbar">
            <div className="topbar-in">
              <div><div className="page-h1">{t(view)}</div><div className="page-sub">{subtitle}</div></div>
              <div className="spacer" />
              <div className="live-pill"><span className="live-dot" /> {t("openNow")} · {DATA.meta.close}</div>
              <div className="searchbox"><Icon.search /><input placeholder={t("search")} /></div>
              <ThemeToggle />
              <LangSwitch />
              <button className="iconbtn"><Icon.bell /><span className="dot" /></button>
            </div>
          </div>

          <div className="canvas">
            <Active key={view + lang} toast={toast} go={go} />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="bottomnav">
          {PRIMARY.map(k => {
            const n = NAV.find(x => x.k === k); const I = Icon[n.ic]; const b = badgeVal(n.badge);
            return <button key={k} className={"bnav " + (view === k ? "on" : "")} onClick={() => go(k)}><I />{b > 0 && <span className="badge-n">{b}</span>}<span>{t(k)}</span></button>;
          })}
          <button className={"bnav " + (!PRIMARY.includes(view) ? "on" : "")} onClick={() => setSheet(true)}><Icon.more /><span>{t("more")}</span></button>
        </nav>

        {/* More sheet */}
        {sheet && (
          <React.Fragment>
            <div className="scrim" style={{ zIndex: 94 }} onClick={() => setSheet(false)} />
            <div className="sheet">
              <div className="grab" />
              <div className="sheet-grid">
                {NAV.filter(n => !PRIMARY.includes(n.k)).map(n => {
                  const I = Icon[n.ic];
                  return <button key={n.k} className={"sheet-item " + (view === n.k ? "on" : "")} onClick={() => go(n.k)}><I /><span>{t(n.k)}</span></button>;
                })}
              </div>
            </div>
          </React.Fragment>
        )}

        {/* AI FAB + panel */}
        <div className="fab"><button className="fab-btn" onClick={() => setAi(true)}><Icon.sparkles /><span>{t("aiAssistant")}</span></button></div>
        {ai && <AIPanel onClose={() => setAi(false)} />}

        {toastMsg && <Toast msg={toastMsg} />}
      </div>
    </I18nContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
