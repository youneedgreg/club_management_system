import { IncomeManager, type IncomeChart } from "@/components/income/income-manager";
import { moneyK } from "@/lib/format";
import { getActiveClubId } from "@/server/active-club";
import {
  countSales,
  getIncomeByCategory,
  getMonthlyTrend,
  getPaymentMix,
  getRecentSales,
  getRevenueByHour,
  getTonightDate,
  getTonightPnl,
  getTopSellers,
  getWeeklyPnl,
  listProducts,
  listSaleStaff,
} from "@/server/services";

type Range = "tonight" | "week" | "month";

/** Sale timestamp → "HH:mm" in the venue's timezone (seed stores +03:00). */
const saleTime = (at: Date): string =>
  at.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Nairobi",
  });

/** Income — live, session-scoped takings with a record-a-sale form. */
export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range: Range = sp.range === "week" || sp.range === "month" ? sp.range : "tonight";
  const clubId = await getActiveClubId();
  const date = await getTonightDate(clubId);

  const [pnl, byHour, byCat, mix, sellers, recent, txns, products, staff] = await Promise.all([
    getTonightPnl(clubId, date),
    getRevenueByHour(clubId, date, "bar"),
    getIncomeByCategory(clubId, date, "bar"),
    getPaymentMix(clubId, date),
    getTopSellers(clubId, date),
    getRecentSales(clubId, date, 12),
    countSales(clubId, date),
    listProducts(clubId),
    listSaleStaff(clubId),
  ]);

  // The selected range drives the headline chart + gross total, recomputed here.
  let chart: IncomeChart;
  let rangeTotal: number;
  if (range === "week") {
    const w = await getWeeklyPnl(clubId);
    chart = {
      kind: "week",
      data: w.rows.map((r) => ({
        day: r.dayLabel ?? "",
        rev: r.revenue,
        cost: r.cost,
        tonight: r.isTonight,
      })),
    };
    rangeTotal = w.revenue;
  } else if (range === "month") {
    const m = await getMonthlyTrend(clubId);
    chart = {
      kind: "bars",
      data: m.map((r) => ({ h: r.monthLabel ?? "", v: r.revenue, label: moneyK(r.revenue) })),
    };
    rangeTotal = m.reduce((s, r) => s + r.revenue, 0);
  } else {
    chart = {
      kind: "bars",
      data: byHour.map((r) => ({ h: r.hour, v: r.amount, label: moneyK(r.amount) })),
    };
    rangeTotal = pnl.income;
  }

  return (
    <IncomeManager
      range={range}
      rangeTotal={rangeTotal}
      chart={chart}
      income={pnl.income}
      footfall={pnl.footfall}
      tablesOpen={pnl.tablesOpen}
      transactions={txns}
      avg={pnl.footfall > 0 ? Math.round(pnl.income / pnl.footfall) : 0}
      bottles={sellers.reduce((s, x) => s + x.units, 0)}
      categories={byCat.map((c) => ({ key: c.categoryKey, amount: c.amount }))}
      paymentMix={mix.map((p) => ({
        method: p.method,
        pct: Math.round(Number(p.pct)),
        amount: p.amount,
      }))}
      feed={recent.map((s) => ({
        id: s.id,
        time: saleTime(s.occurredAt),
        location: s.location,
        description: s.description,
        paymentMethod: s.paymentMethod,
        amount: s.amount,
      }))}
      products={products.map((p) => ({ id: p.id, name: p.name, sell: p.sell, unit: p.unit }))}
      staff={staff}
    />
  );
}
