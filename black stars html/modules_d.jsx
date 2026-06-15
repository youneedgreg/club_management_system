/* Black Stars — Modules D: Kitchen (income + expenses), Suppliers (accounts payable) */
const { useState: useStateD } = React;

/* ============ KITCHEN ============ */
function Kitchen({ toast }) {
  const { t } = useT();
  const k = DATA.kitchen;
  const [added, setAdded] = useStateD([]);
  const [showForm, setShowForm] = useStateD(false);
  const income = k.byHour.reduce((s, d) => s + d.v, 0);
  const allExp = [...added, ...k.expensesToday];
  const expToday = allExp.reduce((s, e) => s + e.amt, 0);
  const net = income - expToday;
  const ordersServed = k.orders.filter(o => o.status === "served").length;
  const monthExp = k.expenseByCategory.reduce((s, c) => s + c.v, 0);
  const save = (e) => { setAdded(a => [e, ...a]); setShowForm(false); toast(t("expenseAdded")); };

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad" style={{ background: "linear-gradient(150deg, rgba(63,214,160,.12), var(--surface) 60%)", borderColor: "rgba(63,214,160,.25)" }}>
          <Stat label={t("kitchenIncome")} icon="pot" color="var(--green)" value={income} size={28} delta={9} />
        </div>
        <div className="card card-pad"><Stat label={t("kitchenExpenses")} icon="expenses" color="var(--red)" value={expToday} size={26} /></div>
        <div className="card card-pad"><Stat label={t("kitchenNet")} icon="star" color="var(--gold)" value={net} size={26} /></div>
        <div className="card card-pad"><Stat label={t("ordersServed")} icon="receipt" color="var(--blue)" value={ordersServed} cur={false} size={28} foot={"/ " + k.orders.length} /></div>
      </div>

      <div className="split">
        <div className="card card-pad">
          <CardTitle icon="trendUp" color="var(--green)" title={t("foodSalesByHour")} />
          <BarChart data={k.byHour} color="var(--green)" peakKey="12am" fmt={moneyK} h={150} />
        </div>
        <div className="card card-pad">
          <CardTitle icon="pot" color="var(--gold)" title={t("byCategory")} />
          <div className="row" style={{ gap: 16 }}>
            <Donut data={k.incomeByCategory.map(c => ({ value: c.v, color: KCAT[c.key].c }))} size={116} thickness={15}
              center={<div><div className="num" style={{ fontSize: 13, fontWeight: 700 }}>{moneyK(income)}</div><div style={{ fontSize: 10, color: "var(--faint)" }}>{t("total")}</div></div>} />
            <div style={{ flex: 1 }}>
              <Legend data={k.incomeByCategory.map(c => ({ label: t(c.key), value: DATA.meta.currency + " " + moneyK(c.v), color: KCAT[c.key].c }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="split-r">
        <div className="card card-pad">
          <CardTitle icon="expenses" color="var(--red)" title={t("byCategory")} />
          <div className="row" style={{ gap: 18 }}>
            <Donut data={k.expenseByCategory.map(c => ({ value: c.v, color: KECAT[c.key].c }))} size={130} thickness={16}
              center={<div><div className="num" style={{ fontSize: 15, fontWeight: 700 }}>{moneyK(monthExp)}</div><div style={{ fontSize: 10, color: "var(--faint)" }}>{t("thisMonth")}</div></div>} />
            <div style={{ flex: 1 }}>
              <Legend data={k.expenseByCategory.map(c => ({ label: t(c.key), value: DATA.meta.currency + " " + moneyK(c.v), color: KECAT[c.key].c }))} />
            </div>
          </div>
        </div>
        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 4 }}>
            <CardTitle icon="receipt" color="var(--gold)" title={t("kitchenExpenses") + " · " + t("tonight")} />
            <button className="btn gold sm" onClick={() => setShowForm(true)}><Icon.plus /> {t("addExpense")}</button>
          </div>
          <div className="list">
            {allExp.map((e, i) => (
              <div className="li" key={i} style={e.isNew ? { animation: "pgIn .35s ease" } : undefined}>
                <IcChip name={KECAT[e.cat].ic} color={KECAT[e.cat].c} />
                <div className="gr"><div className="t1">{e.label}</div><div className="t2">{t(e.cat)} · {e.t}{e.pay ? " · " + t(e.pay) : ""}</div></div>
                {e.isNew && <span className="chip green" style={{ marginInlineEnd: 4 }}>{t("justAdded")}</span>}
                {e.recurring && <span className="chip hide-mobile" style={{ marginInlineEnd: 4 }}><Icon.clock style={{ width: 12, height: 12 }} /> {t("recurring")}</span>}
                <div className="amt neg">−<Money v={e.amt} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <CardTitle icon="pot" color="var(--green)" title={t("recentOrders")} />
        <div className="list">
          {k.orders.map((o, i) => (
            <div className="li" key={i}>
              <IcChip name="pot" color="var(--green)" />
              <div className="gr"><div className="t1">{o.item}{o.qty > 1 ? ` ×${o.qty}` : ""}</div><div className="t2">{o.table} · {o.t}</div></div>
              <span className={"chip " + (o.status === "served" ? "green" : "gold")}>{o.status === "served" ? <Icon.check style={{ width: 12, height: 12 }} /> : <Icon.clock style={{ width: 12, height: 12 }} />} {t(o.status)}</span>
              <div className="amt pos">+<Money v={o.amt} /></div>
            </div>
          ))}
        </div>
      </div>

      {showForm && <ExpenseForm catMap={KECAT} defaultCat="ingredients" title={t("newKitchenExpense")} onClose={() => setShowForm(false)} onSave={save} />}
    </Page>
  );
}

/* ============ SUPPLIERS (ACCOUNTS PAYABLE) ============ */
const termsDays = (terms) => terms === "Monthly" ? 30 : parseInt(terms, 10) || 0;

function SupplierPayModal({ supplier, balance, onClose, onPay, toast }) {
  const { t } = useT();
  const cur = DATA.meta.currency;
  const fmtNum = (v) => v ? Number(v).toLocaleString("en-US") : "";
  const [amount, setAmount] = useStateD(String(balance));
  const [method, setMethod] = useStateD("mpesa");
  const [preset, setPreset] = useStateD("full");
  const amt = parseInt(amount || "0", 10);
  const valid = amt > 0 && amt <= balance;
  const setQuick = (k) => { setPreset(k); setAmount(String(k === "full" ? balance : Math.round(balance / 2))); };
  const submit = () => {
    if (!valid) return;
    onPay(amt, method);
    if (amt >= balance) toast(t("markedPaid") + " · " + supplier.name);
    else toast(t("recorded") + " · " + cur + " " + fmtNum(amt));
    onClose();
  };

  return (
    <div className="modal-wrap">
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head between">
          <div className="row" style={{ gap: 12 }}>
            <IcChip name={SCAT[supplier.category].ic} color={SCAT[supplier.category].c} />
            <div><div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 17 }}>{supplier.name}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{t(supplier.category)} · {t("terms")}: {supplier.terms}</div></div>
          </div>
          <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose}><Icon.close /></button>
        </div>
        <div className="modal-body">
          <div className="pay-stat">
            <div><div className="pl">{t("totalPayable")}</div><div className="pv"><Money v={balance} /></div></div>
            <div><div className="pl">{t("dueDate")}</div><div className="pv">{supplier.dueDate}</div></div>
            <div><div className="pl">{t("lastOrder")}</div><div className="pv">{supplier.lastOrder}</div></div>
          </div>
          <div className="field">
            <label>{t("amountPaid")}</label>
            <div className="quick-amt" style={{ marginBottom: 10 }}>
              <button className={preset === "half" ? "on" : ""} onClick={() => setQuick("half")}>{t("half")} · {cur} {fmtNum(Math.round(balance / 2))}</button>
              <button className={preset === "full" ? "on" : ""} onClick={() => setQuick("full")}>{t("payInFull")} · {cur} {fmtNum(balance)}</button>
            </div>
            <div className="amount-input"><span className="cur">{cur}</span><input inputMode="numeric" value={fmtNum(amount)} onChange={e => { setPreset(""); setAmount(e.target.value.replace(/[^0-9]/g, "")); }} /></div>
          </div>
          <div className="field">
            <label>{t("paymentMethod")}</label>
            <Seg value={method} onChange={setMethod} options={[{ k: "mpesa", label: t("mpesa") }, { k: "cash", label: t("cash") }, { k: "card", label: t("card") }]} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>{t("cancel")}</button>
          <button className="btn gold" style={{ flex: 2, opacity: valid ? 1 : .45, pointerEvents: valid ? "auto" : "none" }} onClick={submit}><Icon.check /> {t("paySupplier")}</button>
        </div>
      </div>
    </div>
  );
}

function Suppliers({ toast }) {
  const { t } = useT();
  const [paidAmt, setPaidAmt] = useStateD({});
  const [payTarget, setPayTarget] = useStateD(null);
  const list = DATA.suppliers.map(s => ({ ...s, balance: Math.max(0, s.owed - (paidAmt[s.name] || 0)) }));
  const totalPayable = list.reduce((s, x) => s + x.balance, 0);
  const overdue = list.filter(s => s.balance > 0 && s.age > termsDays(s.terms));
  const overdueAmt = overdue.reduce((s, x) => s + x.balance, 0);
  const dueAmt = totalPayable - overdueAmt;
  const active = list.filter(s => s.balance > 0);
  const sorted = [...list].sort((a, b) => b.balance - a.balance);

  const pay = (amt, method) => setPaidAmt(p => ({ ...p, [payTarget.name]: (p[payTarget.name] || 0) + amt }));

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad" style={{ background: "linear-gradient(150deg, rgba(255,111,111,.1), var(--surface) 60%)", borderColor: "rgba(255,111,111,.25)" }}>
          <Stat label={t("totalPayable")} icon="banknote" color="var(--red)" value={totalPayable} size={28} />
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>{active.length} {t("activeSuppliers")}</div>
        </div>
        <div className="card card-pad"><Stat label={t("overdue")} icon="warn" color="var(--red)" value={overdueAmt} size={26} foot={overdue.length + " " + t("activeSuppliers").toLowerCase()} /></div>
        <div className="card card-pad"><Stat label={t("dueThisWeek")} icon="clock" color="var(--gold)" value={dueAmt} size={26} /></div>
        <div className="card card-pad"><Stat label={t("activeSuppliers")} icon="truck" color="var(--blue)" value={DATA.suppliers.length} cur={false} size={28} /></div>
      </div>

      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 6 }}>
          <CardTitle icon="banknote" color="var(--red)" title={t("accountsPayable")} />
          <span className="num" style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 16, color: "var(--red)" }}><Money v={totalPayable} /></span>
        </div>
        <div className="stack" style={{ gap: 0 }}>
          {sorted.map((s, i) => {
            const od = s.balance > 0 && s.age > termsDays(s.terms);
            const paidOff = s.balance === 0;
            return (
              <div className="li" key={i} style={{ flexWrap: "wrap" }}>
                <IcChip name={SCAT[s.category].ic} color={SCAT[s.category].c} />
                <div className="gr" style={{ minWidth: 150 }}>
                  <div className="t1">{s.name}</div>
                  <div className="t2">{t(s.category)} · {t("lastOrder")} {s.lastOrder}</div>
                </div>
                <div style={{ textAlign: "center", minWidth: 110 }}>
                  {paidOff
                    ? <span className="chip green"><Icon.checkCircle style={{ width: 12, height: 12 }} /> {t("markedPaid")}</span>
                    : <span className={"chip " + (od ? "red" : "gold")}>{od ? <Icon.warn style={{ width: 12, height: 12 }} /> : <Icon.clock style={{ width: 12, height: 12 }} />} {t("dueDate")} {s.dueDate}</span>}
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 4 }}>{t("terms")}: {s.terms}</div>
                </div>
                <div style={{ textAlign: "end", minWidth: 96 }}>
                  <div className="num" style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 16, color: od ? "var(--red)" : "var(--text)" }}><Money v={s.balance} /></div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn ghost sm" onClick={() => toast(t("remind") + " · " + s.name)} title={t("remind")}><Icon.phone /></button>
                  <button className="btn gold sm" style={paidOff ? { opacity: .45, pointerEvents: "none" } : undefined} onClick={() => setPayTarget(s)}>{t("paySupplier")}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {payTarget && <SupplierPayModal supplier={payTarget} balance={payTarget.balance} onClose={() => setPayTarget(null)} onPay={pay} toast={toast} />}
    </Page>
  );
}

Object.assign(window, { Kitchen, Suppliers, SupplierPayModal });
