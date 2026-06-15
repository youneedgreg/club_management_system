/* Black Stars — Modules B: Credit, Staff, Reports, Settings */
const { useState: useStateB } = React;

const SwitchB = ({ on, onClick }) => (
  <button onClick={onClick} aria-pressed={on} style={{
    width: 46, height: 27, borderRadius: 99, padding: 3, flex: "0 0 auto",
    background: on ? "var(--gold)" : "var(--surface-2)", border: "1px solid " + (on ? "transparent" : "var(--line-2)"),
    display: "flex", justifyContent: on ? "flex-end" : "flex-start", transition: ".18s"
  }}>
    <span style={{ width: 21, height: 21, borderRadius: "50%", background: on ? "#1b1302" : "var(--faint)", transition: ".18s" }} />
  </button>
);

/* ============ CREDIT (DENI) ============ */
function Credit({ toast }) {
  const { t } = useT();
  const totalOwed = DATA.credit.reduce((s, c) => s + c.bal, 0);
  const overdue = DATA.credit.filter(c => c.age > 7);
  const overdueAmt = overdue.reduce((s, c) => s + c.bal, 0);
  const currentAmt = totalOwed - overdueAmt;
  const sorted = [...DATA.credit].sort((a, b) => b.bal - a.bal);

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad" style={{ background: "linear-gradient(150deg, rgba(181,145,255,.12), var(--surface) 60%)", borderColor: "rgba(181,145,255,.25)" }}>
          <Stat label={t("totalOwed")} icon="credit" color="var(--violet)" value={totalOwed} size={28} />
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>{DATA.credit.length} {t("customersOwing")}</div>
        </div>
        <div className="card card-pad"><Stat label={t("overdue")} icon="warn" color="var(--red)" value={overdueAmt} size={26} foot={overdue.length + " " + t("customersOwing")} /></div>
        <div className="card card-pad"><Stat label={t("current")} icon="checkCircle" color="var(--green)" value={currentAmt} size={26} /></div>
        <div className="card card-pad"><Stat label={t("aging")} icon="clock" color="var(--gold)" value={21} cur={false} size={26} foot={t("days") + " " + t("overdue").toLowerCase()} /></div>
      </div>

      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 6 }}>
          <CardTitle icon="credit" color="var(--violet)" title={t("deni")} />
          <button className="btn green sm" onClick={() => toast(t("sendReminder"))}><Icon.whatsapp /> <span className="hide-mobile">{t("sendReminder")}</span></button>
        </div>
        <div className="stack" style={{ gap: 0 }}>
          {sorted.map((c, i) => {
            const od = c.age > 7;
            return (
              <div className="li" key={i} style={{ flexWrap: "wrap" }}>
                <span className="av" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</span>
                <div className="gr" style={{ minWidth: 140 }}>
                  <div className="t1">{c.name}</div>
                  <div className="t2">{c.note} · <span className="num">{c.phone}</span></div>
                </div>
                <div style={{ textAlign: "center", minWidth: 88 }}>
                  <span className={"chip " + (od ? "red" : "green")}>{od ? <Icon.warn style={{ width: 12, height: 12 }} /> : <Icon.clock style={{ width: 12, height: 12 }} />} {c.age} {t("days")}</span>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 4 }}>{t("lastPaid")} {c.lastPaid}</div>
                </div>
                <div style={{ textAlign: "end", minWidth: 96 }}>
                  <div className="num" style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 16, color: od ? "var(--red)" : "var(--text)" }}><Money v={c.bal} /></div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn ghost sm" onClick={() => toast(t("remind") + " · " + c.name)} title={t("remind")}><Icon.whatsapp /></button>
                  <button className="btn gold sm" onClick={() => toast(t("settle") + " · " + c.name)}>{t("settleUp")}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}

/* ============ STAFF ============ */
function Staff({ toast }) {
  const { t } = useT();
  const present = DATA.staff.filter(s => s.status === "present");
  const wageCost = present.filter(s => !s.isFee).reduce((s, x) => s + x.wage, 0);
  const absent = DATA.staff.filter(s => s.status === "absent");
  const djFee = DATA.staff.find(s => s.isFee);

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad"><Stat label={t("onShift")} icon="staff" color="var(--green)" value={present.length} cur={false} size={28} foot={"/ " + DATA.staff.length} /></div>
        <div className="card card-pad"><Stat label={t("wageCost")} icon="wallet" color="var(--gold)" value={wageCost} size={26} /></div>
        <div className="card card-pad"><Stat label={t("absent")} icon="warn" color="var(--red)" value={absent.length} cur={false} size={28} /></div>
        <div className="card card-pad"><Stat label={t("dj")} icon="music" color="var(--violet)" value={djFee.wage} size={26} foot={djFee.name} /></div>
      </div>

      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 6 }}>
          <CardTitle icon="staff" color="var(--gold)" title={t("roster")} />
          <span className="chip green"><span className="live-dot" /> {present.length} {t("onShift")}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>{t("name")}</th><th className="hide-mobile">{t("role")}</th><th className="hide-mobile">{t("clockIn")}</th><th style={{ textAlign: "end" }}>{t("shift")}</th><th style={{ textAlign: "end" }}>{t("status")}</th></tr></thead>
            <tbody>
              {DATA.staff.map((s, i) => {
                const on = s.status === "present";
                return (
                  <tr key={i}>
                    <td><div className="row" style={{ gap: 11 }}><span className="av" style={{ background: on ? avatarColor(s.name) : "var(--surface-2)", color: on ? "#fff" : "var(--faint)", opacity: on ? 1 : .6 }}>{initials(s.name)}</span><div><div className="r-name">{s.name}</div><div className="r-sub only-mobile" style={{ display: "block" }}>{t(s.role)}</div></div></div></td>
                    <td className="hide-mobile"><span className="chip" style={{ color: ROLE[s.role], background: softBg(ROLE[s.role]), borderColor: softBg(ROLE[s.role]) }}>{t(s.role)}</span></td>
                    <td className="hide-mobile num muted">{s.in || "—"}</td>
                    <td style={{ textAlign: "end" }}><span className="num dimt"><Money v={s.wage} />{s.isFee ? "" : ""}</span></td>
                    <td style={{ textAlign: "end" }}>{on ? <span className="chip green"><Icon.check style={{ width: 12, height: 12 }} /> {t("present")}</span> : <span className="chip red">{t("absent")}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

/* ============ REPORTS ============ */
function Reports({ toast }) {
  const { t } = useT();
  const income = DATA.byHour.reduce((s, d) => s + d.v, 0);
  const exp = DATA.expensesTonight.reduce((s, d) => s + d.amt, 0);
  const net = income - exp;
  const margin = Math.round(net / income * 100);
  const weekRev = DATA.weekly.reduce((s, d) => s + d.rev, 0);
  const weekCost = DATA.weekly.reduce((s, d) => s + d.cost, 0);
  const best = [...DATA.weekly].sort((a, b) => b.rev - a.rev)[0];
  const maxMonth = Math.max(...DATA.monthly.map(m => m.v));

  return (
    <Page>
      {/* End of night hero */}
      <div className="card" style={{ overflow: "hidden", borderColor: "var(--gold-line)" }}>
        <div style={{ padding: "22px 24px", background: "linear-gradient(135deg, rgba(236,187,78,.16), rgba(63,214,160,.05) 70%, transparent)" }}>
          <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
            <div className="row" style={{ gap: 13 }}>
              <span className="brand-logo" style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "radial-gradient(120% 120% at 30% 20%, #2a2a32, #111114)", border: "1px solid var(--gold-line)" }}><Icon.star style={{ width: 22, height: 22, color: "var(--gold)" }} /></span>
              <div>
                <div className="eyebrow" style={{ color: "var(--gold-2)" }}>{t("endOfNight")}</div>
                <div style={{ fontFamily: "var(--disp)", fontSize: 20, fontWeight: 600, marginTop: 3 }}>{DATA.meta.club} · {DATA.meta.night}</div>
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn ghost sm" onClick={() => toast(t("shareWhatsapp"))}><Icon.whatsapp /> <span className="hide-mobile">{t("shareWhatsapp")}</span></button>
              <button className="btn gold sm" onClick={() => toast(t("downloadPdf"))}><Icon.download /> <span className="hide-mobile">{t("downloadPdf")}</span></button>
            </div>
          </div>
        </div>
        <div className="card-pad cols4" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="stat"><div className="lab">{t("revenue")}</div><div className="val pos" style={{ fontSize: 26 }}><Money v={income} /></div></div>
          <div className="stat"><div className="lab">{t("costs")}</div><div className="val neg" style={{ fontSize: 26 }}><Money v={exp} /></div></div>
          <div className="stat"><div className="lab">{t("profit")}</div><div className="val goldt" style={{ fontSize: 26 }}><Money v={net} /></div></div>
          <div className="stat"><div className="lab">{t("margin")}</div><div className="val" style={{ fontSize: 26 }}><span className="num">{margin}%</span></div><div style={{ marginTop: 8 }}><span className="chip"><Icon.door style={{ width: 12, height: 12 }} /> {DATA.tonight.doorEntries} {t("footfall").toLowerCase()}</span></div></div>
        </div>
      </div>

      <div className="split">
        <div className="card card-pad">
          <CardTitle icon="reports" color="var(--gold)" title={t("weeklyPnl")} />
          <div className="between" style={{ marginBottom: 16 }}>
            <div className="row" style={{ gap: 18 }}>
              <div><div className="muted" style={{ fontSize: 11.5 }}>{t("revenue")}</div><div className="num pos" style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 18, marginTop: 3 }}><Money v={weekRev} /></div></div>
              <div><div className="muted" style={{ fontSize: 11.5 }}>{t("profit")}</div><div className="num goldt" style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 18, marginTop: 3 }}><Money v={weekRev - weekCost} /></div></div>
            </div>
            <div className="row" style={{ gap: 12, fontSize: 11.5 }}>
              <span className="row" style={{ gap: 6 }}><span className="dotled" style={{ background: "var(--green)" }} /> {t("revenue")}</span>
              <span className="row" style={{ gap: 6 }}><span className="dotled" style={{ background: "var(--red)" }} /> {t("costs")}</span>
            </div>
          </div>
          <WeekBars data={DATA.weekly} />
          <div className="row" style={{ marginTop: 14, gap: 8 }}><span className="chip gold"><Icon.flame style={{ width: 12, height: 12 }} /> {t("bestNight")}: {best.day} · {DATA.meta.currency} {moneyK(best.rev)}</span></div>
        </div>
        <div className="card card-pad">
          <CardTitle icon="trendUp" color="var(--green)" title={t("monthlyTrend")} />
          <div style={{ marginBottom: 6 }}><div className="muted" style={{ fontSize: 12 }}>{t("revenue")} · {DATA.monthly[4].m}</div><div className="num" style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 22, marginTop: 4 }}><Money v={DATA.monthly[4].v} /></div></div>
          <Spark data={DATA.monthly.map(m => m.v)} color="var(--green)" h={76} />
          <div className="cols2" style={{ marginTop: 14, gap: 10 }}>
            {DATA.monthly.slice(-4).map((m, i) => (
              <div key={i} className="between" style={{ padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10 }}>
                <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{m.m}{m.partial ? " ·" : ""}</span>
                <span className="num" style={{ fontSize: 13, fontWeight: 600 }}>{DATA.meta.currency} {moneyK(m.v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

/* ============ SETTINGS ============ */
function Settings({ toast }) {
  const { t, lang, setLang, theme, setTheme } = useT();
  const [notif, setNotif] = useStateB({ low: true, deni: true, close: false, daily: true });
  const langs = ["en", "fr", "ar"];

  const Row = ({ icon, color, label, sub, children }) => (
    <div className="li">
      <IcChip name={icon} color={color} />
      <div className="gr"><div className="t1">{label}</div>{sub && <div className="t2">{sub}</div>}</div>
      {children}
    </div>
  );

  return (
    <Page>
      <div className="card card-pad" style={{ background: "linear-gradient(150deg, rgba(236,187,78,.1), var(--surface) 55%)", borderColor: "var(--gold-line)" }}>
        <div className="row" style={{ gap: 16 }}>
          <span className="av" style={{ width: 56, height: 56, fontSize: 20, background: "linear-gradient(135deg,var(--gold),#b6862c)", color: "#1a1304" }}>BS</span>
          <div className="gr">
            <div style={{ fontFamily: "var(--disp)", fontSize: 19, fontWeight: 600 }}>{DATA.meta.club}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 3 }}><Icon.pin style={{ width: 13, height: 13, verticalAlign: "-2px" }} /> {DATA.meta.location}</div>
          </div>
          <span className="chip green"><span className="live-dot" /> {t("openNow")}</span>
        </div>
      </div>

      <div className="card card-pad">
        <CardTitle icon="sun" color="var(--gold)" title={t("appearance")} />
        <div className="between">
          <div className="row" style={{ gap: 12 }}>
            <IcChip name={theme === "light" ? "sun" : "moon"} color="var(--gold)" />
            <div><div style={{ fontWeight: 600, fontSize: 14 }}>{t("theme")}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{t(theme === "light" ? "light" : "dark")}</div></div>
          </div>
          <Seg value={theme === "light" ? "light" : "dark"} onChange={setTheme} options={[{ k: "dark", label: t("dark") }, { k: "light", label: t("light") }]} />
        </div>
      </div>

      <div className="cols2">
        <div className="card card-pad">
          <CardTitle icon="globe" color="var(--gold)" title={t("language")} />
          <div className="stack" style={{ gap: 8 }}>
            {langs.map(l => (
              <button key={l} className="lang-opt" style={{ border: "1px solid " + (lang === l ? "var(--gold-line)" : "var(--line)"), background: lang === l ? "var(--gold-soft)" : "transparent" }} onClick={() => setLang(l)}>
                <span className="fl">{I18N[l]._flag}</span>
                <span><div className="nat" style={{ color: lang === l ? "var(--gold-2)" : "var(--text)" }}>{I18N[l]._native}</div><div className="en">{I18N[l]._name} · {I18N[l]._dir.toUpperCase()}</div></span>
                {lang === l && <Icon.check className="ck" />}
              </button>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <CardTitle icon="settings" color="var(--blue)" title={t("businessProfile")} />
          <div className="list">
            <Row icon="wallet" color="var(--gold)" label={t("currency")}><span className="chip gold">KES · {DATA.meta.currency}</span></Row>
            <Row icon="warn" color="var(--red)" label={t("lowStockThreshold")} sub={t("parLevel")}><span className="chip">≤ {t("parLevel")}</span></Row>
            <Row icon="clock" color="var(--violet)" label={t("nightlyClose")} sub={t("endOfNight")}><span className="chip num">4:00 AM</span></Row>
            <Row icon="card" color="var(--mpesa)" label={t("mpesa")} sub="Paybill · 247247"><span className="chip mpesa"><Icon.check style={{ width: 12, height: 12 }} /> {t("live")}</span></Row>
          </div>
        </div>
      </div>

      <div className="cols2">
        <div className="card card-pad">
          <CardTitle icon="bell" color="var(--gold)" title={t("notifications")} />
          <div className="list">
            <Row icon="warn" color="var(--red)" label={t("lowStockAlerts")}><SwitchB on={notif.low} onClick={() => setNotif({ ...notif, low: !notif.low })} /></Row>
            <Row icon="credit" color="var(--violet)" label={t("deni")}><SwitchB on={notif.deni} onClick={() => setNotif({ ...notif, deni: !notif.deni })} /></Row>
            <Row icon="reports" color="var(--green)" label={t("endOfNight")}><SwitchB on={notif.daily} onClick={() => setNotif({ ...notif, daily: !notif.daily })} /></Row>
            <Row icon="clock" color="var(--blue)" label={t("nightlyClose")}><SwitchB on={notif.close} onClick={() => setNotif({ ...notif, close: !notif.close })} /></Row>
          </div>
        </div>

        <div className="card card-pad">
          <CardTitle icon="users" color="var(--green)" title={t("users")} />
          <div className="list">
            {[{ n: "Daniel", r: "Owner", c: "var(--gold)" }, { n: "Faith Achieng", r: t("supervisor"), c: "var(--green)" }, { n: "Mercy Wanjiru", r: t("cashier"), c: "var(--blue)" }].map((u, i) => (
              <div className="li" key={i}>
                <span className="av" style={{ background: avatarColor(u.n) }}>{initials(u.n)}</span>
                <div className="gr"><div className="t1">{u.n}</div><div className="t2">{u.r}</div></div>
                <span className="chip" style={{ color: u.c, background: softBg(u.c), borderColor: softBg(u.c) }}>{u.r}</span>
              </div>
            ))}
            <button className="btn ghost sm" style={{ marginTop: 12, alignSelf: "flex-start" }} onClick={() => toast(t("addNew"))}><Icon.plus /> {t("addNew")}</button>
          </div>
        </div>
      </div>
    </Page>
  );
}

Object.assign(window, { Credit, Staff, Reports, Settings });
