import { ExpenseManager } from "@/components/expenses/expense-manager";
import { getActiveClubId } from "@/server/active-club";
import { getExpenseByCategory, getTonightDate, listExpenses, monthStart } from "@/server/services";

/** Expenses (bar) — live, session-scoped tonight log + monthly category mix. */
export default async function ExpensesPage() {
  const clubId = await getActiveClubId();
  const date = await getTonightDate(clubId);
  const [tonight, byCategory] = await Promise.all([
    listExpenses(clubId, date, "bar"),
    getExpenseByCategory(clubId, monthStart(date), "bar"),
  ]);

  return (
    <ExpenseManager
      tonight={tonight}
      byCategory={byCategory.map((c) => ({ key: c.categoryKey, amount: c.amount }))}
    />
  );
}
