"use client";

import { useState } from "react";
import { CardTitle, Donut, IcChip, Legend, Money, Page, Seg, Stat } from "@/components/bs";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { ExpenseForm } from "@/components/expenses/expense-form";
import type { ExpenseRow } from "@/server/services";
import { DATA } from "@/lib/data";
import { moneyK } from "@/lib/format";
import { ECAT } from "@/lib/meta";

type Filter = "all" | "recurring";
type FormState = { mode: "add" } | { mode: "edit"; expense: ExpenseRow } | null;

export function ExpenseManager({
  tonight,
  byCategory,
}: {
  tonight: ExpenseRow[];
  byCategory: { key: string; amount: number }[];
}) {
  const { t } = useT();
  const [filter, setFilter] = useState<Filter>("all");
  const [form, setForm] = useState<FormState>(null);

  const expTonight = tonight.reduce((s, e) => s + e.amount, 0);
  const monthTotal = byCategory.reduce((s, c) => s + c.amount, 0);
  const recurringTotal = tonight.filter((e) => e.recurring).reduce((s, e) => s + e.amount, 0);
  const top = byCategory[0] ?? null;
  const rows = filter === "recurring" ? tonight.filter((e) => e.recurring) : tonight;

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad">
          <Stat
            label={t("tonightExpenses")}
            icon="expenses"
            color="var(--red)"
            value={expTonight}
            size={26}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("thisMonthSpend")}
            icon="calendar"
            color="var(--gold)"
            value={monthTotal}
            size={26}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("recurring")}
            icon="clock"
            color="var(--blue)"
            value={recurringTotal}
            size={26}
            foot={
              expTonight > 0
                ? Math.round((recurringTotal / expTonight) * 100) +
                  "% " +
                  t("tonight").toLowerCase()
                : undefined
            }
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={top ? t(top.key) : t("expenses")}
            icon="truck"
            color="var(--violet)"
            value={top?.amount ?? 0}
            size={26}
            foot={t("thisMonth")}
          />
        </div>
      </div>

      <div className="split-r">
        <div className="card card-pad">
          <CardTitle icon="expenses" color="var(--red)" title={t("byCategory")} />
          <div className="row" style={{ gap: 18 }}>
            <Donut
              data={byCategory.map((c) => ({
                value: c.amount,
                color: ECAT[c.key]?.c ?? "var(--gold)",
              }))}
              size={130}
              thickness={16}
              center={
                <div>
                  <div className="num" style={{ fontSize: 15, fontWeight: 700 }}>
                    {moneyK(monthTotal)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--faint)" }}>{t("thisMonth")}</div>
                </div>
              }
            />
            <div style={{ flex: 1 }}>
              <Legend
                data={byCategory.map((c) => ({
                  label: t(c.key),
                  value: DATA.meta.currency + " " + moneyK(c.amount),
                  color: ECAT[c.key]?.c ?? "var(--gold)",
                }))}
              />
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <CardTitle
              icon="receipt"
              color="var(--gold)"
              title={t("expenses") + " · " + t("tonight")}
            />
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <Seg
                value={filter}
                onChange={setFilter}
                options={[
                  { k: "all", label: t("all") },
                  { k: "recurring", label: t("recurring") },
                ]}
              />
              <button className="btn gold sm" onClick={() => setForm({ mode: "add" })}>
                <Icon.plus /> {t("addExpense")}
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="muted" style={{ fontSize: 13, padding: "18px 2px" }}>
              {t("noExpensesYet")}
            </div>
          ) : (
            <div className="list">
              {rows.map((e) => {
                const m = ECAT[e.categoryKey] ?? { c: "var(--gold)", ic: "receipt" as const };
                return (
                  <div
                    className="li"
                    key={e.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setForm({ mode: "edit", expense: e })}
                  >
                    <IcChip name={m.ic} color={m.c} />
                    <div className="gr">
                      <div className="t1">{e.label}</div>
                      <div className="t2">
                        {t(e.categoryKey)} · {e.time}
                      </div>
                    </div>
                    {e.recurring && (
                      <span className="chip hide-mobile" style={{ marginInlineEnd: 4 }}>
                        <Icon.clock style={{ width: 12, height: 12 }} /> {t("recurring")}
                      </span>
                    )}
                    <div className="amt neg">
                      −<Money v={e.amount} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {form && (
        <ExpenseForm
          expense={form.mode === "edit" ? form.expense : null}
          onClose={() => setForm(null)}
        />
      )}
    </Page>
  );
}
