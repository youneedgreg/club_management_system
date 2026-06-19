/**
 * Verify the seeded data reproduces the prototype's figures, exercising the
 * real repositories/aggregation helpers (`src/server/services`). Run with
 * `pnpm db:verify`. Exits non-zero if any assertion fails.
 *
 * Aging is "as of now" in the app, so for the fixed seed night we pin the
 * reference dates that reproduce the prototype's hard-coded `age` values:
 * credit as of the morning after (14 Jun), suppliers as of 15 Jun.
 */
import { getDefaultClubId } from "@/server/services";
import { getCredit } from "@/server/services/credit";
import { getTotalExpenses } from "@/server/services/expenses";
import { getIncomeByCategory, getPaymentMix, getTopSellers } from "@/server/services/income";
import { listProducts } from "@/server/services/inventory";
import { getKitchenPnl, getKitchenExpenseByCategory } from "@/server/services/kitchen";
import { getLineupSummary, getLineup } from "@/server/services/lineup";
import { getMonthlyTrend, getTonightPnl, getWeeklyPnl } from "@/server/services/reports";
import { getRecentSales } from "@/server/services/sales";
import { getCasualPayroll, getPermanentPayroll, getTonightRoster } from "@/server/services/staff";
import { getPayables } from "@/server/services/suppliers";
import { calc } from "@/server/services";

import { NIGHT } from "./seed-constants";

const CREDIT_ASOF = "2026-06-14";
const SUPPLIER_ASOF = "2026-06-15";

let failures = 0;
const fmt = (v: unknown) => (typeof v === "number" ? v.toLocaleString("en-US") : String(v));

function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(
    `  ${ok ? "✓" : "✗"} ${label}: ${fmt(actual)}${ok ? "" : ` (expected ${fmt(expected)})`}`,
  );
}

async function main() {
  const clubId = await getDefaultClubId();

  console.log("Counts");
  check("products", (await listProducts(clubId)).length, 18);
  check("recent sales", (await getRecentSales(clubId, NIGHT, 100)).length, 10);
  const payables = await getPayables(clubId, SUPPLIER_ASOF);
  check("suppliers", payables.rows.length, 8);
  const credit = await getCredit(clubId, CREDIT_ASOF);
  check("credit customers", credit.rows.length, 5);
  const lineup = await getLineup(clubId);
  check("lineup nights", lineup.length, 7);
  check("bookings", lineup.flatMap((n) => n.bookings).length, 12);

  console.log("\nTonight P&L (bar)");
  const pnl = await getTonightPnl(clubId, NIGHT);
  check("income", pnl.income, 958_000);
  check("expenses", pnl.expenses, 254_000);
  check("net", pnl.net, 704_000);
  check("margin %", pnl.margin, 73);
  check("footfall", pnl.footfall, 412);
  check("tables open", pnl.tablesOpen, 14);
  check("biggest sale", pnl.biggestSale, 19_200);
  check("peak hour", pnl.peakHour, "00:00");

  console.log("\nIncome breakdowns");
  const byCat = await getIncomeByCategory(clubId, NIGHT, "bar");
  check("income-by-category rows", byCat.length, 6);
  check(
    "income-by-category total",
    calc.sumBy(byCat, (c) => c.amount),
    958_000,
  );
  const mix = await getPaymentMix(clubId, NIGHT);
  check(
    "payment-mix total",
    calc.sumBy(mix, (m) => m.amount),
    958_000,
  );
  check(
    "payment-mix %",
    mix.reduce((s, m) => s + Number(m.pct), 0),
    100,
  );
  const top = await getTopSellers(clubId, NIGHT);
  check("top sellers", top.length, 5);
  check("top seller revenue", top[0]?.revenue, 162_000);

  console.log("\nWeekly & monthly");
  const week = await getWeeklyPnl(clubId);
  check("week revenue", week.revenue, 2_808_000);
  check("week cost", week.cost, 974_000);
  check("week net", week.net, 1_834_000);
  check("best night revenue", week.best?.revenue, 958_000);
  check("best night", week.best?.dayLabel, "Sat");
  const months = await getMonthlyTrend(clubId);
  check("months", months.length, 6);
  check("Jun revenue", months.at(-1)?.revenue, 11_400_000);
  check("Jun partial", months.at(-1)?.partial, true);

  console.log("\nCredit (Deni)");
  check("total owed", credit.totalOwed, 264_500);
  check("overdue amount", credit.overdueAmt, 185_000);
  check("overdue count", credit.overdueCount, 2);

  console.log("\nPayables (suppliers)");
  check("total payable", payables.totalPayable, 437_000);
  check("overdue amount", payables.overdueAmt, 54_000);

  console.log("\nStaff");
  const roster = await getTonightRoster(clubId, NIGHT);
  check("present", roster.presentCount, 8);
  check("wage cost", roster.wageCost, 16_200);
  const perm = await getPermanentPayroll(clubId);
  check("permanent gross", perm.totalGross, 159_000);
  check("permanent net", perm.totalNet, 126_700);
  const casual = await getCasualPayroll(clubId);
  check("casual wage bill", casual.totalWageBill, 40_970);
  check("casual commission", casual.totalCommission, 3_670);
  check("casual net", casual.totalNet, 37_370);

  console.log("\nKitchen");
  const kitchen = await getKitchenPnl(clubId, NIGHT);
  check("income", kitchen.income, 218_000);
  check("expenses", kitchen.expenses, 71_700);
  check("net", kitchen.net, 146_300);
  const kExp = await getKitchenExpenseByCategory(clubId, "2026-06-01");
  check(
    "month expense total",
    calc.sumBy(kExp, (c) => c.amount),
    972_000,
  );
  // sanity: bar expenses are isolated from kitchen on the same night
  check("bar expenses (isolated)", await getTotalExpenses(clubId, NIGHT, "bar"), 254_000);

  console.log("\nLineup");
  const ls = await getLineupSummary(clubId);
  check("total fees", ls.total, 217_000);
  check("paid", ls.paid, 58_000);
  check("outstanding", ls.outstanding, 159_000);
  check("paid acts", ls.paidActs, 4);
  check("owed count", ls.owedCount, 8);

  console.log(`\n${failures === 0 ? "✓ All checks passed." : `✗ ${failures} check(s) failed.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("✗ Verify crashed:", err);
  process.exit(1);
});
