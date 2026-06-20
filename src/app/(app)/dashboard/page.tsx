/** Dashboard — live, session-scoped figures (ported from prototype `Dashboard`). */
import { getTranslations } from "next-intl/server";
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
import { isAuthConfigured } from "@/lib/auth/server";
import { requireMembership } from "@/lib/auth/session";
import { DATA } from "@/lib/data";
import { money, moneyK } from "@/lib/format";
import { CAT, PAY } from "@/lib/meta";
import {
  calc,
  getDefaultClubId,
  getPaymentMix,
  getPreviousNightPnl,
  getRecentSales,
  getRevenueByHour,
  getTonightDate,
  getTonightPnl,
  getTopSellers,
  listLowStock,
} from "@/server/services";

/** Session-scoped club, falling back to the seeded club before auth is wired. */
async function activeClubId(): Promise<string> {
  if (!isAuthConfigured) return getDefaultClubId();
  return (await requireMembership()).clubId;
}

/** Sale timestamp → "HH:mm" in the venue's timezone (seed stores +03:00). */
const saleTime = (at: Date): string =>
  at.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Nairobi",
  });

const chipClass = (method: string): string =>
  method === "mpesa" ? "mpesa" : method === "card" ? "blue" : "gold";

export default async function DashboardPage() {
  const t = await getTranslations();
  const clubId = await activeClubId();
  const date = await getTonightDate(clubId);

  const [pnl, prev, byHour, mix, sellers, recent, low] = await Promise.all([
    getTonightPnl(clubId, date),
    getPreviousNightPnl(clubId, date),
    getRevenueByHour(clubId, date, "bar"),
    getPaymentMix(clubId, date),
    getTopSellers(clubId, date),
    getRecentSales(clubId, date, 6),
    listLowStock(clubId),
  ]);

  const incomeDelta = prev ? calc.pctDelta(pnl.income, prev.income) : null;
  const expenseDelta = prev ? calc.pctDelta(pnl.expenses, prev.expenses) : null;
  const netDelta = prev ? calc.pctDelta(pnl.net, prev.net) : null;
  const avg = pnl.footfall > 0 ? Math.round(pnl.income / pnl.footfall) : 0;
  const maxUnits = Math.max(1, ...sellers.map((s) => s.units));
  const topPay = mix[0];

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
            value={pnl.net}
            size={32}
            delta={netDelta ?? undefined}
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
            value={pnl.income}
            size={28}
            delta={incomeDelta ?? undefined}
            foot={incomeDelta !== null ? t("vsYesterday") : undefined}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("tonightExpenses")}
            icon="expenses"
            color="var(--red)"
            value={pnl.expenses}
            size={28}
            delta={expenseDelta ?? undefined}
            foot={expenseDelta !== null ? t("vsYesterday") : undefined}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("entriesTonight")}
            icon="door"
            color="var(--gold-2)"
            value={pnl.footfall}
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
            href="/income"
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
                <Money v={pnl.income} />
              </div>
            </div>
            {pnl.peakHour && (
              <span className="chip">
                <Icon.clock style={{ width: 13, height: 13 }} /> {t("peakHour")} · {pnl.peakHour}
              </span>
            )}
          </div>
          <BarChart data={byHour.map((r) => ({ h: r.hour, v: r.amount }))} fmt={moneyK} />
        </div>
        <div className="card card-pad">
          <CardTitle icon="wallet" color="var(--mpesa)" title={t("paymentMix")} />
          <div className="row" style={{ gap: 18, alignItems: "center" }}>
            <Donut
              data={mix.map((p) => ({ value: p.amount, color: PAY[p.method].c }))}
              center={
                topPay ? (
                  <div>
                    <div
                      style={{ fontSize: 18, fontWeight: 700, color: PAY[topPay.method].c }}
                      className="num"
                    >
                      {Math.round(Number(topPay.pct))}%
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--faint)" }}>{t(topPay.method)}</div>
                  </div>
                ) : undefined
              }
            />
            <div style={{ flex: 1 }}>
              <Legend
                data={mix.map((p) => ({
                  label: t(p.method),
                  value: Math.round(Number(p.pct)) + "%",
                  color: PAY[p.method].c,
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
            href="/stock"
          />
          <div className="list">
            {low.slice(0, 4).map((s) => (
              <div className="li" key={s.id}>
                <IcChip name={CAT[s.category].ic} color={CAT[s.category].c} />
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
            href="/income"
          />
          <div className="list">
            {sellers.map((s, i) => (
              <div className="li" key={s.id}>
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
                  <div className="t1">{s.productName}</div>
                  <div style={{ marginTop: 6 }}>
                    <Progress value={s.units} max={maxUnits} color={CAT[s.category].c} h={5} />
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
          href="/income"
        />
        <div className="list">
          {recent.map((s) => {
            const p = PAY[s.paymentMethod];
            return (
              <div className="li" key={s.id}>
                <IcChip name={p.ic} color={p.c} />
                <div className="gr">
                  <div className="t1">{s.description}</div>
                  <div className="t2">
                    {s.location} · {saleTime(s.occurredAt)}
                  </div>
                </div>
                <span
                  className={"chip " + chipClass(s.paymentMethod)}
                  style={{ marginInlineEnd: 4 }}
                >
                  {t(s.paymentMethod)}
                </span>
                <div className="amt pos">
                  +<Money v={s.amount} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
