/* Black Stars — Module C: Lineup ledger (partial pay, M-Pesa, receipt, % fees, multi-week) */
const { useState: useStateC } = React;

const roleColorC = (r) => r === "actMc" ? "var(--blue)" : r === "actHost" ? "var(--violet)" : "var(--gold)";
const BASE_MONDAY = new Date(2026, 5, 15, 12);
const dayMs = 86400000;
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12); };
const weekDateAt = (off, i) => new Date(2026, 5, 15 + off * 7 + i, 12);
const offsetForISO = (s) => Math.max(0, Math.floor(Math.round((parseISO(s) - BASE_MONDAY) / dayMs) / 7));
const SHORT_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INCOME_TONIGHT = DATA.byHour.reduce((s, d) => s + d.v, 0);

const buildBookings = () => {
  const codes = ["QGH4XZ8R2K", "RJ81PLM5TQ", "SK29WD7VHN", "TL64BN3CXP"];
  let id = 1, ci = 0; const out = [];
  DATA.lineup.days.forEach((d) => {
    if (!d.acts) return;
    d.acts.forEach((a) => {
      const iso = `2026-06-${d.date}`;
      const isPct = a.feeType === "pct";
      let payments = [];
      if (a.paid) payments = [{ amount: isPct ? 0 : a.fee, method: "mpesa", code: codes[ci++ % codes.length], receipt: null, time: "13 Jun" }];
      if (a.name === "DJ Joe Mfalme" && iso === "2026-06-19") payments = [{ amount: 15000, method: "mpesa", code: "TJ57QK21LM", receipt: null, time: "14 Jun" }];
      out.push({ id: id++, date: iso, label: d.label, flagship: d.flagship, name: a.name, role: a.role, time: a.time,
        feeType: isPct ? "pct" : "fixed", pct: a.pct || null, fee: a.fee || 0, guest: a.guest, payments });
    });
  });
  return out;
};

const paidOf = (b) => b.payments.reduce((s, p) => s + p.amount, 0);
const isPctUnknown = (b) => b.feeType === "pct" && b.fee === 0 && paidOf(b) === 0;
const ratioOf = (b) => b.fee === 0 ? 0 : Math.max(0, Math.min(1, paidOf(b) / b.fee));
const fmtNum = (v) => v ? Number(v).toLocaleString("en-US") : "";

/* ---------- Record-payment modal ---------- */
function PayModal({ booking: b, onClose, onAdd, onRemove, toast }) {
  const { t } = useT();
  const cur = DATA.meta.currency;
  const isPct = b.feeType === "pct";
  const paid = paidOf(b);
  const [gross, setGross] = useStateC(isPct ? INCOME_TONIGHT : 0);
  const calcFee = isPct ? Math.round((b.pct / 100) * gross) : b.fee;
  const remaining = Math.max(0, calcFee - paid);
  const [amount, setAmount] = useStateC(String(remaining));
  const [method, setMethod] = useStateC("mpesa");
  const [code, setCode] = useStateC("");
  const [receipt, setReceipt] = useStateC(null);
  const [preset, setPreset] = useStateC("full");
  const amt = parseInt(amount || "0", 10);
  const canPay = isPct ? gross > 0 && remaining > 0 : remaining > 0;
  const valid = amt > 0 && amt <= remaining && (isPct ? gross > 0 : true);

  const setQuick = (k) => { setPreset(k); setAmount(String(k === "full" ? remaining : Math.round(remaining / 2))); };
  const updateGross = (v) => { setGross(v); const rem = Math.max(0, Math.round((b.pct / 100) * v) - paid); setAmount(String(rem)); setPreset("full"); };
  const submit = () => {
    if (!valid) return;
    const now = new Date().toLocaleDateString("en", { day: "numeric", month: "short" });
    onAdd(b.id, { amount: amt, method, code: code.trim() || null, receipt, time: now }, isPct ? calcFee : undefined);
    if (paid + amt >= calcFee) toast(t("paidInFull") + " · " + b.name);
    else toast(t("recorded") + " · " + cur + " " + fmtNum(amt));
    onClose();
  };

  return (
    <div className="modal-wrap">
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head between">
          <div className="row" style={{ gap: 12 }}>
            <span className="av" style={{ background: roleColorC(b.role), color: "#1b1302" }}>{initials(b.name)}</span>
            <div><div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 17 }}>{b.name}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{b.label} · {t(b.role)}{isPct && <span className="chip gold" style={{ marginInlineStart: 6, padding: "2px 8px" }}>{b.pct}% {t("pctOfSales")}</span>}</div>
            </div>
          </div>
          <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose}><Icon.close /></button>
        </div>
        <div className="modal-body">
          {isPct && (
            <div className="field">
              <label>{t("fromGross")} <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>· {b.pct}% = {cur} {gross > 0 ? fmtNum(Math.round(b.pct / 100 * gross)) : "?"}</span></label>
              <div className="amount-input" style={{ borderColor: "var(--gold-line)" }}>
                <span className="cur">{cur}</span>
                <input autoFocus inputMode="numeric" placeholder="Gross sales tonight" value={gross > 0 ? gross.toLocaleString("en-US") : ""} onChange={e => updateGross(parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
              </div>
              {gross > 0 && <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>{t("calculated")}: {cur} {fmtNum(calcFee)} &nbsp;·&nbsp; {t("remaining")}: {cur} {fmtNum(remaining)}</div>}
            </div>
          )}
          <div className="pay-stat">
            <div><div className="pl">{t("fee")}</div><div className="pv">{isPct ? `${b.pct}%` : <Money v={b.fee} />}{isPct && gross > 0 && <span className="muted" style={{ fontSize: 12, fontWeight: 500 }}> · {cur}{fmtNum(calcFee)}</span>}</div></div>
            <div><div className="pl">{t("paidLabel")}</div><div className="pv pos">{cur} {fmtNum(paid)}</div></div>
            <div><div className="pl">{t("remaining")}</div><div className="pv" style={{ color: remaining > 0 ? "var(--gold-2)" : "var(--green)" }}>{!isPct || gross > 0 ? `${cur} ${fmtNum(remaining)}` : "—"}</div></div>
          </div>
          {calcFee > 0 && <Progress value={paid} max={calcFee} color="var(--gold)" h={7} />}

          {canPay && (
            <React.Fragment>
              <div className="field">
                <label>{t("amountPaid")}</label>
                <div className="quick-amt" style={{ marginBottom: 10 }}>
                  <button className={preset === "half" ? "on" : ""} onClick={() => setQuick("half")}>{t("half")} · {cur} {fmtNum(Math.round(remaining / 2))}</button>
                  <button className={preset === "full" ? "on" : ""} onClick={() => setQuick("full")}>{t("payInFull")} · {cur} {fmtNum(remaining)}</button>
                </div>
                <div className="amount-input"><span className="cur">{cur}</span><input inputMode="numeric" value={fmtNum(amount)} onChange={e => { setPreset(""); setAmount(e.target.value.replace(/[^0-9]/g, "")); }} /></div>
              </div>
              <div className="field">
                <label>{t("paymentMethod")}</label>
                <Seg value={method} onChange={setMethod} options={[{ k: "mpesa", label: t("mpesa") }, { k: "cash", label: t("cash") }, { k: "card", label: t("card") }]} />
              </div>
              <div className="field">
                <label>{method === "mpesa" ? t("mpesaCode") : t("reference")} · <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>{t("optional")}</span></label>
                <input className="input num" placeholder={method === "mpesa" ? "e.g. TJ57QK21LM" : "—"} value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={16} />
              </div>
              <label className="file-btn">
                {receipt ? <React.Fragment><Icon.checkCircle style={{ color: "var(--green)" }} /> {receipt}</React.Fragment> : <React.Fragment><Icon.receipt /> {t("attachReceipt")} · <span className="muted">{t("optional")}</span></React.Fragment>}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) setReceipt(f.name); }} />
              </label>
            </React.Fragment>
          )}
          {!canPay && paid >= calcFee && calcFee > 0 && <div className="chip green" style={{ alignSelf: "flex-start" }}><Icon.checkCircle style={{ width: 13, height: 13 }} /> {t("paidInFull")}</div>}

          {b.payments.length > 0 && (
            <div className="field">
              <label>{t("paymentHistory")}</label>
              <div>
                {b.payments.map((p, i) => (
                  <div className="phist" key={i}>
                    <IcChip name={PAY[p.method].ic} color={PAY[p.method].c} size={32} r={9} />
                    <div className="gr" style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{cur} {fmtNum(p.amount)} <span className="muted" style={{ fontWeight: 500 }}>· {t(p.method)}</span></div>
                      <div className="pcode">{p.code || "—"}{p.receipt ? " · 📎 " + p.receipt : ""} · {p.time}</div>
                    </div>
                    <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => onRemove(b.id, i)}><Icon.close style={{ width: 15, height: 15 }} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>{t("cancel")}</button>
          {canPay && <button className="btn gold" style={{ flex: 2, opacity: valid ? 1 : .45, pointerEvents: valid ? "auto" : "none" }} onClick={submit}><Icon.check /> {t("recordPayment")}</button>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Add-booking modal ---------- */
function BookingForm({ defaultISO, onClose, onSave, toast }) {
  const { t } = useT();
  const cur = DATA.meta.currency;
  const [date, setDate] = useStateC(defaultISO);
  const [label, setLabel] = useStateC("");
  const [name, setName] = useStateC("");
  const [role, setRole] = useStateC("actDj");
  const [time, setTime] = useStateC("");
  const [feeType, setFeeType] = useStateC("fixed");
  const [fee, setFee] = useStateC("");
  const [pct, setPct] = useStateC("");
  const isPct = feeType === "pct";
  const valid = name.trim() && date && (isPct ? parseFloat(pct) > 0 && parseFloat(pct) <= 100 : parseInt(fee || "0", 10) > 0);
  const submit = () => {
    if (!valid) return;
    onSave({ date, label: label.trim() || (isPct ? t("actDj") + " set" : label.trim()) || "Event", name: name.trim(), role, time: time.trim() || "TBC",
      feeType, pct: isPct ? parseFloat(pct) : null, fee: isPct ? 0 : parseInt(fee, 10), guest: false });
    toast(t("booked") + " · " + name.trim()); onClose();
  };
  return (
    <div className="modal-wrap">
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head between">
          <div className="row" style={{ gap: 12 }}><IcChip name="calendar" color="var(--gold)" /><div><div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 17 }}>{t("addBooking")}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{t("lineup")}</div></div></div>
          <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose}><Icon.close /></button>
        </div>
        <div className="modal-body">
          <div className="cols2" style={{ gap: 14 }}>
            <div className="field"><label>{t("date")}</label><input className="input" type="date" min={isoOf(BASE_MONDAY)} value={date} onChange={e => setDate(e.target.value)} /></div>
            <div className="field"><label>{t("setTimeLabel")}</label><input className="input" placeholder="10:00 PM" value={time} onChange={e => setTime(e.target.value)} /></div>
          </div>
          <div className="field"><label>{t("eventNight")}</label><input className="input" placeholder="Black Stars Saturday" value={label} onChange={e => setLabel(e.target.value)} /></div>
          <div className="field"><label>{t("actName")}</label><input className="input" placeholder="DJ Joe Mfalme" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="field"><label>{t("role")}</label><Seg value={role} onChange={setRole} options={[{ k: "actDj", label: t("actDj") }, { k: "actHost", label: t("actHost") }, { k: "actMc", label: t("actMc") }]} /></div>
          <div className="field">
            <label>{t("feeType")}</label>
            <Seg value={feeType} onChange={setFeeType} options={[{ k: "fixed", label: t("fixedAmt") }, { k: "pct", label: t("pctOfSales") }]} />
          </div>
          {isPct ? (
            <div className="field">
              <label>{t("percentage")} (%)</label>
              <div className="amount-input" style={{ borderColor: "var(--gold-line)" }}>
                <span className="cur">%</span>
                <input autoFocus inputMode="decimal" placeholder="15" value={pct} onChange={e => setPct(e.target.value.replace(/[^0-9.]/g, ""))} />
                <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{t("pctOfSales")}</span>
              </div>
              {parseFloat(pct) > 0 && <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>{t("calculated")} {t("fromGross")}: {cur} {fmtNum(Math.round(parseFloat(pct) / 100 * INCOME_TONIGHT))} (est.)</div>}
            </div>
          ) : (
            <div className="field"><label>{t("fee")}</label><div className="amount-input"><span className="cur">{cur}</span><input inputMode="numeric" placeholder="0" value={fmtNum(fee)} onChange={e => setFee(e.target.value.replace(/[^0-9]/g, ""))} /></div></div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>{t("cancel")}</button>
          <button className="btn gold" style={{ flex: 2, opacity: valid ? 1 : .45, pointerEvents: valid ? "auto" : "none" }} onClick={submit}><Icon.check /> {t("saveBooking")}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Lineup ---------- */
function Lineup({ toast }) {
  const { t } = useT();
  const cur = DATA.meta.currency;
  const [bookings, setBookings] = useStateC(buildBookings);
  const [view, setView] = useStateC("list");
  const [off, setOff] = useStateC(0);
  const [payId, setPayId] = useStateC(null);
  const [adding, setAdding] = useStateC(false);

  const addPayment = (id, p, feeUpd) => setBookings(bs => bs.map(b => b.id === id ? { ...b, fee: feeUpd !== undefined ? feeUpd : b.fee, payments: [...b.payments, p] } : b));
  const removePayment = (id, i) => setBookings(bs => bs.map(b => b.id === id ? { ...b, payments: b.payments.filter((_, k) => k !== i) } : b));
  const addBooking = (bk) => {
    const id = Math.max(0, ...bookings.map(b => b.id)) + 1;
    setBookings(bs => [...bs, { ...bk, id, payments: [] }]);
    setOff(offsetForISO(bk.date));
  };

  // global totals (skip pct-unknown in outstanding figure)
  let total = 0, paidSum = 0, paidActs = 0; const dates = new Set(); const owed = [];
  bookings.forEach(b => {
    const p = paidOf(b); dates.add(b.date);
    if (!isPctUnknown(b)) { total += b.fee; paidSum += Math.min(p, b.fee); }
    if (p >= b.fee && b.fee > 0) paidActs++;
    if (isPctUnknown(b)) owed.push({ ...b, rem: null });
    else if (p < b.fee) owed.push({ ...b, rem: b.fee - p });
  });
  const outstanding = total - paidSum;

  const weekDays = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = weekDateAt(off, i); const iso = isoOf(d);
    const acts = bookings.filter(b => b.date === iso);
    return { d, iso, dow: SHORT_DAY[d.getDay()], dnum: d.getDate(), label: acts[0]?.label, flagship: acts.some(a => a.flagship), acts };
  });
  const ws = weekDateAt(off, 0), we = weekDateAt(off, 6);
  const rangeLabel = `${ws.getDate()} – ${we.getDate()} ${SHORT_MON[we.getMonth()]}`;
  const weekTag = off === 0 ? t("thisWeek") : off === 1 ? t("nextWeek") : `+${off} ${t("weeks")}`;
  const payBooking = bookings.find(b => b.id === payId);

  return (
    <Page>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="row" style={{ gap: 10 }}>
          <div className="wk-nav">
            <button onClick={() => setOff(o => Math.max(0, o - 1))} disabled={off === 0}><Icon.chevLeft /></button>
            <button onClick={() => setOff(o => o + 1)}><Icon.chevRight /></button>
          </div>
          <div><div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 16 }}>{rangeLabel}</div><div className="muted" style={{ fontSize: 11.5, marginTop: 1 }}>{weekTag}</div></div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Seg value={view} onChange={setView} options={[{ k: "list", label: t("listView") }, { k: "calendar", label: t("calendar") }]} />
          <button className="btn gold sm" onClick={() => setAdding(true)}><Icon.plus /> {t("addBooking")}</button>
        </div>
      </div>

      <div className="cols4">
        <div className="card card-pad" style={{ background: "linear-gradient(150deg, rgba(236,187,78,.14), var(--surface) 60%)", borderColor: "var(--gold-line)" }}>
          <Stat label={t("owedToArtists")} icon="wallet" color="var(--gold)" value={outstanding} size={28} foot={owed.length + " " + t("unpaid")} />
        </div>
        <div className="card card-pad"><Stat label={t("paidOut")} icon="checkCircle" color="var(--green)" value={paidSum} size={26} foot={paidActs + "/" + bookings.length + " " + t("ofPaid")} /></div>
        <div className="card card-pad"><Stat label={t("actsBooked")} icon="music" color="var(--violet)" value={bookings.length} cur={false} size={26} foot={dates.size + " " + t("nights")} /></div>
        <div className="card card-pad"><Stat label={t("total")} icon="receipt" color="var(--blue)" value={total} size={26} /></div>
      </div>

      {owed.length > 0 && (
        <div className="card card-pad" style={{ borderColor: "var(--gold-line)" }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <CardTitle icon="wallet" color="var(--gold)" title={t("whoYouOwe")} />
            <span className="num goldt" style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 16 }}><Money v={outstanding} /></span>
          </div>
          <div className="wrap-chips">
            {owed.sort((a, b) => parseISO(a.date) - parseISO(b.date)).map((a) => (
              <button key={a.id} className="chip" style={{ padding: "7px 12px", cursor: "pointer" }} onClick={() => setPayId(a.id)}>
                <span className="dotled" style={{ background: roleColorC(a.role) }} />
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{a.name}</span>
                <span className="muted">· {SHORT_DAY[parseISO(a.date).getDay()]} {parseISO(a.date).getDate()}</span>
                <span className="goldt num" style={{ fontWeight: 700 }}>
                  {a.rem === null ? `${a.pct}% TBD` : `${cur} ${moneyK(a.rem)}${a.rem < a.fee ? " " + t("left") : ""}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="stack">
          <div className="muted" style={{ fontSize: 12.5, marginInlineStart: 2, display: "flex", alignItems: "center", gap: 7 }}>
            <Icon.flame style={{ width: 14, height: 14, color: "var(--gold)" }} /> {t("tapToMark")}
          </div>
          {weekDays.filter(d => d.acts.length).map((dd) => {
            const dayTotal = dd.acts.filter(a => a.feeType !== "pct" || a.fee > 0).reduce((s, a) => s + a.fee, 0);
            const dayPaid = dd.acts.filter(a => paidOf(a) >= a.fee && a.fee > 0).length;
            return (
              <div className="day-group" key={dd.iso}>
                <div className="day-head">
                  <div className="dd"><span className="wd">{dd.dow}</span><span className="dn">{dd.dnum}</span></div>
                  <div className="dl">
                    <div className="lb">{dd.label}{dd.flagship && <span className="chip gold"><Icon.star style={{ width: 11, height: 11 }} /> {t("bestNight")}</span>}</div>
                    <div className="mt">{dayPaid}/{dd.acts.length} {t("ofPaid")} · {cur} {money(dayTotal)}{dd.acts.some(a => isPctUnknown(a)) && " + % TBD"}</div>
                  </div>
                </div>
                <div className="acts">
                  {dd.acts.map((a) => {
                    const p = paidOf(a), ratio = ratioOf(a), full = a.fee > 0 && p >= a.fee, part = p > 0 && !full;
                    const rem = a.fee - p;
                    const isPct = a.feeType === "pct";
                    return (
                      <button className="act" key={a.id} onClick={() => setPayId(a.id)}>
                        <span className="hl" style={{ transform: `translateY(-50%) scaleX(${ratio})` }} />
                        <span className={"chk " + (full ? "paid" : part ? "part" : "")} style={part ? { borderColor: "var(--gold)" } : undefined}>
                          {full ? <Icon.check style={{ width: 15, height: 15 }} /> : part ? <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--gold)" }} /> : null}
                        </span>
                        <div className="ainfo">
                          <div className="aname">{a.name}{a.guest && <span className="chip violet">{t("guest")}</span>}{isPct && <span className="chip gold" style={{ padding: "2px 8px" }}>{a.pct}%</span>}</div>
                          <div className="ameta"><span style={{ color: roleColorC(a.role), fontWeight: 600 }}>{t(a.role)}</span> · {a.time}
                            {part && !isPct && <span className="goldt"> · {cur} {fmtNum(p)} {t("ofFee")} {fmtNum(a.fee)}</span>}
                            {part && isPct && <span className="goldt"> · {cur} {fmtNum(p)} {t("paidLabel").toLowerCase()}</span>}
                          </div>
                        </div>
                        <div className="afee">
                          {isPct && a.fee > 0 ? <span>{a.pct}% · <span className="num">{cur} {money(a.fee)}</span></span> : isPct ? <span className="goldt">{a.pct}%</span> : `${cur} ${money(a.fee)}`}
                        </div>
                        <span className={"apill chip " + (full ? "gold" : "")}>
                          {full ? <React.Fragment><Icon.check style={{ width: 12, height: 12 }} /> {t("paidLabel")}</React.Fragment> : part ? <React.Fragment><span className="goldt">{cur} {moneyK(rem)} {t("left")}</span></React.Fragment> : isPct ? `${a.pct}% · ${t("recordPayment")}` : t("recordPayment")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {weekDays.every(d => !d.acts.length) && <div className="card card-pad muted" style={{ textAlign: "center" }}>{t("nothingBooked")} · {rangeLabel}</div>}
        </div>
      )}

      {view === "calendar" && (
        <div className="card card-pad">
          <div className="cal-week">
            {weekDays.map((dd) => (
              <div className={"cal-day " + (dd.flagship ? "flag " : "") + (dd.acts.length ? "" : "closed")} key={dd.iso}>
                <div className="cal-h"><span className="cd-day">{dd.dow}</span><span className="cd-date">{dd.dnum}</span></div>
                {dd.acts.length === 0 ? <div className="cal-closed">{t("nothingBooked")}</div> : (
                  <React.Fragment>
                    <div className="cal-label">{dd.label}</div>
                    {dd.acts.map((a) => {
                      const p = paidOf(a), full = a.fee > 0 && p >= a.fee, part = p > 0 && !full;
                      return (
                        <button className={"cal-act " + (full ? "paid" : part ? "part" : "")} key={a.id} onClick={() => setPayId(a.id)}>
                          <span className="cdot" /><span className="cn">{a.name}</span>
                          <span className="cf">{a.feeType === "pct" ? `${a.pct}%` : moneyK(a.fee)}</span>
                        </button>
                      );
                    })}
                  </React.Fragment>
                )}
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 16, gap: 16, fontSize: 12, flexWrap: "wrap" }}>
            <span className="row" style={{ gap: 6 }}><span className="dotled" style={{ background: "var(--gold)" }} /> {t("paidLabel")}</span>
            <span className="row" style={{ gap: 6 }}><span className="dotled" style={{ background: "var(--gold)", opacity: .5 }} /> {t("partPaid")}</span>
            <span className="row" style={{ gap: 6 }}><span className="dotled" style={{ background: "var(--faint)" }} /> {t("unpaid")}</span>
          </div>
        </div>
      )}

      {payBooking && <PayModal booking={payBooking} onClose={() => setPayId(null)} onAdd={addPayment} onRemove={removePayment} toast={toast} />}
      {adding && <BookingForm defaultISO={isoOf(weekDateAt(off, 5))} onClose={() => setAdding(false)} onSave={addBooking} toast={toast} />}
    </Page>
  );
}

window.Lineup = Lineup;
