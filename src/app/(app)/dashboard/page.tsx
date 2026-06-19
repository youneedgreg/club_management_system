"use client";

/** Dashboard — ported from the prototype `Dashboard` (modules_a.jsx). */
import { useRouter } from "next/navigation";
import {
  BarChart,
  CardTitle,
  Donut,
  IcChip,
  Legend,
  Money,
  Page,
  Progress,
  Stat,
} from "@/components/bs";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { DATA } from "@/lib/data";
import { money, moneyK } from "@/lib/format";
import { CAT, PAY } from "@/lib/meta";

export default function DashboardPage() {
  const { t } = useT();
  const router = useRouter();
  const go = (seg: string) => router.push("/" + seg);

  const income = DATA.byHour.reduce((s, d) => s + d.v, 0);
  const exp = DATA.expensesTonight.reduce((s, d) => s + d.amt, 0);
  const net = income - exp;
  const low = [...DATA.stock]
    .filter((s) => s.onHand < s.par)
    .sort((a, b) => a.onHand / a.par - b.onHand / b.par);
  const avg = Math.round(income / DATA.tonight.doorEntries);
  const maxUnits = Math.max(...DATA.topSellers.map((s) => s.units));

  return (
    <Page>
      <div className="cols4">
        <div
          className="card card-pad"
          style={{
            background: "linear-gradient(150deg, rgba(236,187,78,.14), var(--surface) 60%)",
            borderColor: "var(--gold-line)",
          }}
        >
          <Stat
            label={t("netPosition")}
            icon="star"
            color="var(--gold)"
            value={net}
            size={32}
            delta={18}
          />
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <span className="chip gold">
              <Icon.flame style={{ width: 13, height: 13 }} /> {t("floorIsBusy")}
            </span>
          </div>
        </div>
        <div className="card card-pad">
          <Stat
            label={t("tonightIncome")}
            icon="income"
            color="var(--green)"
            value={income}
            size={28}
            delta={12}
            foot={t("vsYesterday")}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("tonightExpenses")}
            icon="expenses"
            color="var(--red)"
            value={exp}
            size={28}
            delta={-4}
            foot={t("vsYesterday")}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("entriesTonight")}
            icon="door"
            color="var(--gold-2)"
            value={DATA.tonight.doorEntries}
            cur={false}
            size={28}
          />
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            {t("avgSpend")} ·{" "}
            <span className="goldt num">
              {DATA.meta.currency} {money(avg)}
            </span>
          </div>
        </div>
      </div>

      <div className="split">
        <div className="card card-pad">
          <CardTitle
            icon="trendUp"
            color="var(--gold)"
            title={t("revenueByHour")}
            more={t("viewAll")}
            onMore={() => go("income")}
          />
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <div className="muted" style={{ fontSize: 12 }}>
                {t("grossSales")}
              </div>
              <div
                className="val"
                style={{ fontFamily: "var(--disp)", fontSize: 24, fontWeight: 600, marginTop: 4 }}
              >
                <Money v={income} />
              </div>
            </div>
            <span className="chip">
              <Icon.clock style={{ width: 13, height: 13 }} /> {t("peakHour")} ·{" "}
              {DATA.tonight.peakHour}
            </span>
          </div>
          <BarChart data={DATA.byHour} peakKey="12am" fmt={moneyK} />
        </div>
        <div className="card card-pad">
          <CardTitle icon="wallet" color="var(--mpesa)" title={t("paymentMix")} />
          <div className="row" style={{ gap: 18, alignItems: "center" }}>
            <Donut
              data={DATA.paymentMix.map((p) => ({ value: p.v, color: PAY[p.key].c }))}
              center={
                <div>
                  <div
                    style={{ fontSize: 18, fontWeight: 700, color: "var(--mpesa)" }}
                    className="num"
                  >
                    {DATA.paymentMix[0].pct}%
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--faint)" }}>{t("mpesa")}</div>
                </div>
              }
            />
            <div style={{ flex: 1 }}>
              <Legend
                data={DATA.paymentMix.map((p) => ({
                  label: t(p.key),
                  value: p.pct + "%",
                  color: PAY[p.key].c,
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="cols2">
        <div className="card card-pad">
          <CardTitle
            icon="warn"
            color="var(--red)"
            title={t("lowStockAlerts")}
            more={t("stock")}
            onMore={() => go("stock")}
          />
          <div className="list">
            {low.slice(0, 4).map((s, i) => (
              <div className="li" key={i}>
                <IcChip name={CAT[s.cat].ic} color={CAT[s.cat].c} />
                <div className="gr">
                  <div className="t1">{s.name}</div>
                  <div style={{ marginTop: 6 }}>
                    <Progress value={s.onHand} max={s.par} color="var(--red)" h={5} />
                  </div>
                </div>
                <div style={{ textAlign: "end" }}>
                  <div className="num" style={{ fontWeight: 700, fontSize: 13.5 }}>
                    <span className="neg">{s.onHand}</span>
                    <span className="muted">/{s.par}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>
                    {t("parLevel")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <CardTitle
            icon="flame"
            color="var(--gold)"
            title={t("topSellers")}
            more={t("income")}
            onMore={() => go("income")}
          />
          <div className="list">
            {DATA.topSellers.map((s, i) => (
              <div className="li" key={i}>
                <span
                  className="num"
                  style={{
                    width: 20,
                    fontWeight: 700,
                    color: i === 0 ? "var(--gold-2)" : "var(--faint)",
                    fontSize: 14,
                  }}
                >
                  {i + 1}
                </span>
                <div className="gr">
                  <div className="t1">{s.name}</div>
                  <div style={{ marginTop: 6 }}>
                    <Progress value={s.units} max={maxUnits} color={CAT[s.cat].c} h={5} />
                  </div>
                </div>
                <div style={{ textAlign: "end" }}>
                  <div className="num" style={{ fontWeight: 700, fontSize: 13.5 }}>
                    {s.units}
                  </div>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>
                    {t("units")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <CardTitle
          icon="bolt"
          color="var(--gold)"
          title={t("recentActivity")}
          more={t("viewAll")}
          onMore={() => go("income")}
        />
        <div className="list">
          {DATA.sales.slice(0, 6).map((s, i) => {
            const p = PAY[s.pay];
            return (
              <div className="li" key={i}>
                <IcChip name={p.ic} color={p.c} />
                <div className="gr">
                  <div className="t1">{s.desc}</div>
                  <div className="t2">
                    {s.loc} · {s.t}
                  </div>
                </div>
                <span
                  className={
                    "chip " + (s.pay === "mpesa" ? "mpesa" : s.pay === "card" ? "blue" : "gold")
                  }
                  style={{ marginInlineEnd: 4 }}
                >
                  {t(s.pay)}
                </span>
                <div className="amt pos">
                  +<Money v={s.amt} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
