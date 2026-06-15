/* Black Stars — Modules A: Dashboard, Bar Stock, Income, Expenses */
const { useState: useStateA } = React;

/* ============ DASHBOARD ============ */
function Dashboard({ toast, go }) {
  const { t } = useT();
  const income = DATA.byHour.reduce((s, d) => s + d.v, 0);
  const exp = DATA.expensesTonight.reduce((s, d) => s + d.amt, 0);
  const net = income - exp;
  const low = DATA.stock.filter(s => s.onHand < s.par).sort((a, b) => (a.onHand / a.par) - (b.onHand / b.par));
  const avg = Math.round(income / DATA.tonight.doorEntries);
  const maxUnits = Math.max(...DATA.topSellers.map(s => s.units));

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad" style={{ background: "linear-gradient(150deg, rgba(236,187,78,.14), var(--surface) 60%)", borderColor: "var(--gold-line)" }}>
          <Stat label={t("netPosition")} icon="star" color="var(--gold)" value={net} size={32} delta={18} />
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <span className="chip gold"><Icon.flame style={{ width: 13, height: 13 }} /> {t("floorIsBusy")}</span>
          </div>
        </div>
        <div className="card card-pad"><Stat label={t("tonightIncome")} icon="income" color="var(--green)" value={income} size={28} delta={12} foot={t("vsYesterday")} /></div>
        <div className="card card-pad"><Stat label={t("tonightExpenses")} icon="expenses" color="var(--red)" value={exp} size={28} delta={-4} foot={t("vsYesterday")} /></div>
        <div className="card card-pad">
          <Stat label={t("entriesTonight")} icon="door" color="var(--gold-2)" value={DATA.tonight.doorEntries} cur={false} size={28} />
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>{t("avgSpend")} · <span className="goldt num">{DATA.meta.currency} {money(avg)}</span></div>
        </div>
      </div>

      <div className="split">
        <div className="card card-pad">
          <CardTitle icon="trendUp" color="var(--gold)" title={t("revenueByHour")} more={t("viewAll")} onMore={() => go("income")} />
          <div className="between" style={{ marginBottom: 14 }}>
            <div><div className="muted" style={{ fontSize: 12 }}>{t("grossSales")}</div><div className="val" style={{ fontFamily: "var(--disp)", fontSize: 24, fontWeight: 600, marginTop: 4 }}><Money v={income} /></div></div>
            <span className="chip"><Icon.clock style={{ width: 13, height: 13 }} /> {t("peakHour")} · {DATA.tonight.peakHour}</span>
          </div>
          <BarChart data={DATA.byHour} peakKey="12am" fmt={moneyK} />
        </div>
        <div className="card card-pad">
          <CardTitle icon="wallet" color="var(--mpesa)" title={t("paymentMix")} />
          <div className="row" style={{ gap: 18, alignItems: "center" }}>
            <Donut data={DATA.paymentMix.map(p => ({ value: p.v, color: PAY[p.key].c }))} center={
              <div><div style={{ fontSize: 18, fontWeight: 700, color: "var(--mpesa)" }} className="num">{DATA.paymentMix[0].pct}%</div><div style={{ fontSize: 10.5, color: "var(--faint)" }}>{t("mpesa")}</div></div>
            } />
            <div style={{ flex: 1 }}><Legend data={DATA.paymentMix.map(p => ({ label: t(p.key), value: p.pct + "%", color: PAY[p.key].c }))} /></div>
          </div>
        </div>
      </div>

      <div className="cols2">
        <div className="card card-pad">
          <CardTitle icon="warn" color="var(--red)" title={t("lowStockAlerts")} more={t("stock")} onMore={() => go("stock")} />
          <div className="list">
            {low.slice(0, 4).map((s, i) => (
              <div className="li" key={i}>
                <IcChip name={CAT[s.cat].ic} color={CAT[s.cat].c} />
                <div className="gr">
                  <div className="t1">{s.name}</div>
                  <div style={{ marginTop: 6 }}><Progress value={s.onHand} max={s.par} color="var(--red)" h={5} /></div>
                </div>
                <div style={{ textAlign: "end" }}>
                  <div className="num" style={{ fontWeight: 700, fontSize: 13.5 }}><span className="neg">{s.onHand}</span><span className="muted">/{s.par}</span></div>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{t("parLevel")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <CardTitle icon="flame" color="var(--gold)" title={t("topSellers")} more={t("income")} onMore={() => go("income")} />
          <div className="list">
            {DATA.topSellers.map((s, i) => (
              <div className="li" key={i}>
                <span className="num" style={{ width: 20, fontWeight: 700, color: i === 0 ? "var(--gold-2)" : "var(--faint)", fontSize: 14 }}>{i + 1}</span>
                <div className="gr">
                  <div className="t1">{s.name}</div>
                  <div style={{ marginTop: 6 }}><Progress value={s.units} max={maxUnits} color={CAT[s.cat].c} h={5} /></div>
                </div>
                <div style={{ textAlign: "end" }}>
                  <div className="num" style={{ fontWeight: 700, fontSize: 13.5 }}>{s.units}</div>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{t("units")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <CardTitle icon="bolt" color="var(--gold)" title={t("recentActivity")} more={t("viewAll")} onMore={() => go("income")} />
        <div className="list">
          {DATA.sales.slice(0, 6).map((s, i) => {
            const p = PAY[s.pay];
            return (
              <div className="li" key={i}>
                <IcChip name={p.ic} color={p.c} />
                <div className="gr"><div className="t1">{s.desc}</div><div className="t2">{s.loc} · {s.t}</div></div>
                <span className={"chip " + (s.pay === "mpesa" ? "mpesa" : s.pay === "card" ? "blue" : "gold")} style={{ marginInlineEnd: 4 }}>{t(s.pay)}</span>
                <div className="amt pos">+<Money v={s.amt} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}

/* ============ BAR STOCK ============ */
function BarStock({ toast }) {
  const { t } = useT();
  const [cat, setCat] = useStateA("all");
  const stockValue = DATA.stock.reduce((s, x) => s + x.onHand * x.cost, 0);
  const low = DATA.stock.filter(s => s.onHand < s.par);
  const cats = [...new Set(DATA.stock.map(s => s.cat))];
  const rows = cat === "all" ? DATA.stock : DATA.stock.filter(s => s.cat === cat);

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad"><Stat label={t("stockValue")} icon="stock" color="var(--gold)" value={stockValue} size={26} /></div>
        <div className="card card-pad"><Stat label={t("itemsLow")} icon="warn" color="var(--red)" value={low.length} cur={false} size={26} foot={t("needsReorder")} /></div>
        <div className="card card-pad"><Stat label="SKUs" icon="bottle" color="var(--blue)" value={DATA.stock.length} cur={false} size={26} foot={cats.length + " " + t("categories").toLowerCase()} /></div>
        <div className="card card-pad"><Stat label={t("lastDelivery")} icon="truck" color="var(--green)" value="13 Jun" cur={false} size={22} foot="EABL" /></div>
      </div>

      {low.length > 0 && (
        <div className="card card-pad" style={{ borderColor: "rgba(255,111,111,.28)", background: "linear-gradient(120deg, rgba(255,111,111,.07), var(--surface) 55%)" }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div className="row"><IcChip name="warn" color="var(--red)" /><div><div style={{ fontWeight: 700, fontSize: 14 }}>{t("reorderSuggestions")}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{low.length} {t("itemsLow")}</div></div></div>
            <button className="btn gold sm" onClick={() => toast(t("reorder") + " · " + low.length)}><Icon.truck /> {t("reorder")}</button>
          </div>
          <div className="wrap-chips">
            {low.map((s, i) => <span className="chip red" key={i}>{s.name} · {s.onHand}/{s.par}</span>)}
          </div>
        </div>
      )}

      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <CardTitle icon="stock" color="var(--gold)" title={t("barStock")} />
          <div className="wrap-chips">
            <Seg value={cat} onChange={setCat} options={[{ k: "all", label: t("all") }, ...cats.map(c => ({ k: c, label: t(c) }))]} />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>{t("item")}</th><th className="hide-mobile">{t("category")}</th><th>{t("currentStock")}</th><th className="hide-mobile">{t("value")}</th><th style={{ textAlign: "end" }}>{t("status")}</th></tr></thead>
            <tbody>
              {rows.map((s, i) => {
                const lowS = s.onHand < s.par;
                return (
                  <tr key={i}>
                    <td><div className="row" style={{ gap: 11 }}><IcChip name={CAT[s.cat].ic} color={CAT[s.cat].c} size={32} r={9} /><div><div className="r-name">{s.name}</div><div className="r-sub">{s.supplier}</div></div></div></td>
                    <td className="hide-mobile"><span className="chip" style={{ color: CAT[s.cat].c, borderColor: softBg(CAT[s.cat].c), background: softBg(CAT[s.cat].c) }}>{t(s.cat)}</span></td>
                    <td style={{ minWidth: 150 }}>
                      <div className="between" style={{ marginBottom: 6 }}><span className="num" style={{ fontWeight: 700 }}><span style={{ color: lowS ? "var(--red)" : "var(--text)" }}>{s.onHand}</span> <span className="muted" style={{ fontWeight: 500 }}>/ {s.par} {s.unit}</span></span></div>
                      <Progress value={s.onHand} max={s.par} color={lowS ? "var(--red)" : "var(--green)"} h={5} />
                    </td>
                    <td className="hide-mobile"><span className="num dimt"><Money v={s.onHand * s.cost} /></span></td>
                    <td style={{ textAlign: "end" }}>{lowS ? <span className="chip red">{t("low")}</span> : <span className="chip green">{t("healthy")}</span>}</td>
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

/* ============ INCOME ============ */
function Income({ toast }) {
  const { t } = useT();
  const [range, setRange] = useStateA("tonight");
  const income = DATA.byHour.reduce((s, d) => s + d.v, 0);
  const avg = Math.round(income / DATA.tonight.doorEntries);
  const bottles = DATA.topSellers.reduce((s, x) => s + x.units, 0);
  const maxCat = Math.max(...DATA.incomeByCategory.map(c => c.v));

  return (
    <Page>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <span className="chip gold"><Icon.calendar style={{ width: 13, height: 13 }} /> {DATA.meta.night} · {t("live")}</span>
        <Seg value={range} onChange={setRange} options={[{ k: "tonight", label: t("tonight") }, { k: "week", label: t("thisWeek") }, { k: "month", label: t("thisMonth") }]} />
      </div>

      <div className="cols4">
        <div className="card card-pad"><Stat label={t("grossSales")} icon="income" color="var(--green)" value={income} size={26} delta={12} /></div>
        <div className="card card-pad"><Stat label={t("transactions")} icon="receipt" color="var(--gold)" value={326} cur={false} size={26} foot={DATA.tonight.tablesOpen + " " + t("tablesOpen").toLowerCase()} /></div>
        <div className="card card-pad"><Stat label={t("avgSpend")} icon="users" color="var(--blue)" value={avg} size={26} /></div>
        <div className="card card-pad"><Stat label={t("bottlesSold")} icon="bottle" color="var(--violet)" value={bottles} cur={false} size={26} /></div>
      </div>

      <div className="split">
        <div className="card card-pad">
          <CardTitle icon="trendUp" color="var(--green)" title={t("salesByHour")} />
          <BarChart data={DATA.byHour} color="var(--green)" peakKey="12am" fmt={moneyK} h={150} />
        </div>
        <div className="card card-pad">
          <CardTitle icon="wallet" color="var(--mpesa)" title={t("byPaymentMethod")} />
          <div className="row" style={{ gap: 16 }}>
            <Donut data={DATA.paymentMix.map(p => ({ value: p.v, color: PAY[p.key].c }))} size={116} thickness={15}
              center={<div><div className="num" style={{ fontSize: 13, fontWeight: 700 }}>{moneyK(income)}</div><div style={{ fontSize: 10, color: "var(--faint)" }}>{t("total")}</div></div>} />
            <div style={{ flex: 1 }}>
              <Legend data={DATA.paymentMix.map(p => ({ label: t(p.key), value: DATA.meta.currency + " " + moneyK(p.v), color: PAY[p.key].c }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="split-r">
        <div className="card card-pad">
          <CardTitle icon="stock" color="var(--gold)" title={t("byCategory")} />
          <div className="stack" style={{ gap: 14 }}>
            {DATA.incomeByCategory.map((c, i) => (
              <div key={i}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <span className="row" style={{ gap: 8, fontSize: 13, fontWeight: 600 }}><span className="dotled" style={{ background: CAT[c.key].c }} />{c.label || t(c.key)}</span>
                  <span className="num dimt" style={{ fontSize: 13 }}><Money v={c.v} /></span>
                </div>
                <Progress value={c.v} max={maxCat} color={CAT[c.key].c} h={6} />
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 4 }}>
            <CardTitle icon="receipt" color="var(--gold)" title={t("transactions")} />
            <button className="btn ghost sm" onClick={() => toast(t("export"))}><Icon.download /> {t("export")}</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>{t("time")}</th><th>{t("item")}</th><th className="hide-mobile">{t("category")}</th><th style={{ textAlign: "end" }}>{t("amount")}</th></tr></thead>
              <tbody>
                {DATA.sales.map((s, i) => (
                  <tr key={i}>
                    <td className="num muted">{s.t}</td>
                    <td><div className="r-name">{s.desc}</div><div className="r-sub">{s.loc}</div></td>
                    <td className="hide-mobile"><span className={"chip " + (s.pay === "mpesa" ? "mpesa" : s.pay === "card" ? "blue" : "gold")}>{t(s.pay)}</span></td>
                    <td style={{ textAlign: "end" }}><span className="num pos" style={{ fontWeight: 700 }}>+<Money v={s.amt} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}

/* ============ EXPENSES ============ */
function ExpenseForm({ onClose, onSave }) {
  const { t } = useT();
  const cats = Object.keys(ECAT);
  const [amount, setAmount] = useStateA("");
  const [cat, setCat] = useStateA("suppliers");
  const [desc, setDesc] = useStateA("");
  const [pay, setPay] = useStateA("mpesa");
  const [recur, setRecur] = useStateA(false);
  const valid = parseFloat(amount) > 0 && desc.trim().length > 0;
  const submit = () => {
    if (!valid) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    onSave({ label: desc.trim(), cat, amt: Math.round(parseFloat(amount)), recurring: recur, pay, t: now, isNew: true });
  };
  return (
    <div className="modal-wrap">
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head between">
          <div className="row" style={{ gap: 12 }}>
            <IcChip name="expenses" color="var(--red)" />
            <div><div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 17 }}>{t("newExpense")}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{DATA.meta.night}</div></div>
          </div>
          <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose}><Icon.close /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>{t("amountKes")}</label>
            <div className="amount-input"><span className="cur">{DATA.meta.currency}</span><input autoFocus inputMode="numeric" placeholder="0" value={amount ? Number(amount).toLocaleString("en-US") : ""} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))} /></div>
          </div>
          <div className="field">
            <label>{t("selectCategory")}</label>
            <div className="cat-grid">
              {cats.map(c => {
                const m = ECAT[c]; const on = cat === c;
                return (
                  <button key={c} className={"cat-opt " + (on ? "on" : "")} style={on ? { background: softBg(m.c), color: m.c } : undefined} onClick={() => setCat(c)}>
                    {React.createElement(Icon[m.ic], { style: { width: 18, height: 18 } })}<span>{t(c)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="field">
            <label>{t("description")}</label>
            <input className="input" placeholder={t("description")} value={desc} onChange={e => setDesc(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); }} />
          </div>
          <div className="field">
            <label>{t("paymentMethod")}</label>
            <Seg value={pay} onChange={setPay} options={[{ k: "mpesa", label: t("mpesa") }, { k: "cash", label: t("cash") }, { k: "card", label: t("card") }]} />
          </div>
          <div className="between">
            <div className="row" style={{ gap: 10 }}><Icon.clock style={{ width: 16, height: 16, color: "var(--faint)" }} /><span style={{ fontSize: 13.5, fontWeight: 600 }}>{t("recurring")}</span></div>
            <button onClick={() => setRecur(r => !r)} aria-pressed={recur} style={{ width: 46, height: 27, borderRadius: 99, padding: 3, background: recur ? "var(--gold)" : "var(--surface-2)", border: "1px solid " + (recur ? "transparent" : "var(--line-2)"), display: "flex", justifyContent: recur ? "flex-end" : "flex-start", transition: ".18s" }}><span style={{ width: 21, height: 21, borderRadius: "50%", background: recur ? "#1b1302" : "var(--faint)", transition: ".18s" }} /></button>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>{t("cancel")}</button>
          <button className="btn gold" style={{ flex: 2, opacity: valid ? 1 : .45, pointerEvents: valid ? "auto" : "none" }} onClick={submit}><Icon.check /> {t("saveExpense")}</button>
        </div>
      </div>
    </div>
  );
}

function Expenses({ toast }) {
  const { t } = useT();
  const [added, setAdded] = useStateA([]);
  const [showForm, setShowForm] = useStateA(false);
  const allExp = [...added, ...DATA.expensesTonight];
  const expTonight = allExp.reduce((s, d) => s + d.amt, 0);
  const monthTotal = DATA.expenseByCategory.reduce((s, d) => s + d.v, 0);
  const recurring = allExp.filter(e => e.recurring).reduce((s, e) => s + e.amt, 0);
  const top = [...DATA.expenseByCategory].sort((a, b) => b.v - a.v)[0];
  const save = (e) => { setAdded(a => [e, ...a]); setShowForm(false); toast(t("expenseAdded")); };

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad"><Stat label={t("tonightExpenses")} icon="expenses" color="var(--red)" value={expTonight} size={26} delta={-4} /></div>
        <div className="card card-pad"><Stat label={t("thisMonthSpend")} icon="calendar" color="var(--gold)" value={monthTotal} size={26} /></div>
        <div className="card card-pad"><Stat label={t("recurring")} icon="clock" color="var(--blue)" value={recurring} size={26} foot={Math.round(recurring / expTonight * 100) + "% " + t("tonight").toLowerCase()} /></div>
        <div className="card card-pad"><Stat label={t("suppliers")} icon="truck" color="var(--violet)" value={top.v} size={26} foot={t("topSellers").toLowerCase()} /></div>
      </div>

      <div className="split-r">
        <div className="card card-pad">
          <CardTitle icon="expenses" color="var(--red)" title={t("byCategory")} />
          <div className="row" style={{ gap: 18 }}>
            <Donut data={DATA.expenseByCategory.map(c => ({ value: c.v, color: ECAT[c.key].c }))} size={130} thickness={16}
              center={<div><div className="num" style={{ fontSize: 15, fontWeight: 700 }}>{moneyK(monthTotal)}</div><div style={{ fontSize: 10, color: "var(--faint)" }}>{t("thisMonth")}</div></div>} />
            <div style={{ flex: 1 }}>
              <Legend data={DATA.expenseByCategory.map(c => ({ label: t(c.key), value: DATA.meta.currency + " " + moneyK(c.v), color: ECAT[c.key].c }))} />
            </div>
          </div>
        </div>
        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 4 }}>
            <CardTitle icon="receipt" color="var(--gold)" title={t("expenses") + " · " + t("tonight")} />
            <button className="btn gold sm" onClick={() => setShowForm(true)}><Icon.plus /> {t("addExpense")}</button>
          </div>
          <div className="list">
            {allExp.map((e, i) => (
              <div className="li" key={i} style={e.isNew ? { animation: "pgIn .35s ease" } : undefined}>
                <IcChip name={ECAT[e.cat].ic} color={ECAT[e.cat].c} />
                <div className="gr"><div className="t1">{e.label}</div><div className="t2">{t(e.cat)} · {e.t}{e.pay ? " · " + t(e.pay) : ""}</div></div>
                {e.isNew && <span className="chip green" style={{ marginInlineEnd: 4 }}>{t("justAdded")}</span>}
                {e.recurring && <span className="chip hide-mobile" style={{ marginInlineEnd: 4 }}><Icon.clock style={{ width: 12, height: 12 }} /> {t("recurring")}</span>}
                <div className="amt neg">−<Money v={e.amt} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && <ExpenseForm onClose={() => setShowForm(false)} onSave={save} />}
    </Page>
  );
}

Object.assign(window, { Dashboard, BarStock, Income, Expenses });
