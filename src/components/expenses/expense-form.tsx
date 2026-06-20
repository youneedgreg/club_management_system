"use client";

import { useState, useTransition } from "react";
import {
  createExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
} from "@/app/(app)/expenses/actions";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { useToast } from "@/components/shell/toast";
import type { ExpenseRow } from "@/server/services";
import { DATA } from "@/lib/data";
import { softBg } from "@/lib/format";
import { ECAT } from "@/lib/meta";

const CATEGORIES = Object.keys(ECAT);
const toInt = (s: string): number => Math.round(Number(s) || 0);

/** Add (no `expense`) or edit a bar expense. */
export function ExpenseForm({
  expense,
  onClose,
}: {
  expense?: ExpenseRow | null;
  onClose: () => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const editing = Boolean(expense);

  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [cat, setCat] = useState(expense?.categoryKey ?? CATEGORIES[0]);
  const [label, setLabel] = useState(expense?.label ?? "");
  const [recurring, setRecurring] = useState(expense?.recurring ?? false);
  const [confirmDel, setConfirmDel] = useState(false);

  const valid = toInt(amount) > 0 && label.trim().length > 0;

  const submit = () => {
    if (!valid || pending) return;
    const data = { label: label.trim(), categoryKey: cat, amount: toInt(amount), recurring };
    startTransition(async () => {
      const res = editing
        ? await updateExpenseAction(expense!.id, data)
        : await createExpenseAction(data);
      if (res.ok) {
        toast(editing ? t("expenseUpdated") : t("expenseAdded"));
        onClose();
      } else {
        toast(res.error ?? t("somethingWentWrong"), "error");
      }
    });
  };

  const remove = () => {
    if (!expense || pending) return;
    if (!confirmDel) {
      setConfirmDel(true);
      return;
    }
    startTransition(async () => {
      const res = await deleteExpenseAction(expense.id);
      if (res.ok) {
        toast(t("expenseDeleted"));
        onClose();
      } else {
        toast(res.error ?? t("somethingWentWrong"), "error");
      }
    });
  };

  return (
    <div className="modal-wrap">
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <div className="modal-head between">
          <div className="row" style={{ gap: 12 }}>
            <span className="ic" style={{ background: softBg("var(--red)"), color: "var(--red)" }}>
              <Icon.expenses style={{ width: 17, height: 17 }} />
            </span>
            <div>
              <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 17 }}>
                {editing ? t("editExpense") : t("newExpense")}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                {DATA.meta.night}
              </div>
            </div>
          </div>
          <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose}>
            <Icon.close />
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>{t("amountKes")}</label>
            <div className="amount-input">
              <span className="cur">{DATA.meta.currency}</span>
              <input
                autoFocus
                inputMode="numeric"
                placeholder="0"
                value={amount ? Number(amount).toLocaleString("en-US") : ""}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>

          <div className="field">
            <label>{t("selectCategory")}</label>
            <div className="cat-grid">
              {CATEGORIES.map((c) => {
                const m = ECAT[c];
                const on = cat === c;
                const I = Icon[m.ic];
                return (
                  <button
                    key={c}
                    type="button"
                    className={"cat-opt " + (on ? "on" : "")}
                    style={on ? { background: softBg(m.c), color: m.c } : undefined}
                    onClick={() => setCat(c)}
                  >
                    <I style={{ width: 18, height: 18 }} />
                    <span>{t(c)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field">
            <label>{t("description")}</label>
            <input
              className="input"
              placeholder={t("description")}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>

          <div className="between">
            <div className="row" style={{ gap: 10 }}>
              <Icon.clock style={{ width: 16, height: 16, color: "var(--faint)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t("recurring")}</span>
            </div>
            <button
              type="button"
              onClick={() => setRecurring((r) => !r)}
              aria-pressed={recurring}
              style={{
                width: 46,
                height: 27,
                borderRadius: 99,
                padding: 3,
                background: recurring ? "var(--gold)" : "var(--surface-2)",
                border: "1px solid " + (recurring ? "transparent" : "var(--line-2)"),
                display: "flex",
                justifyContent: recurring ? "flex-end" : "flex-start",
                transition: ".18s",
              }}
            >
              <span
                style={{
                  width: 21,
                  height: 21,
                  borderRadius: "50%",
                  background: recurring ? "#1b1302" : "var(--faint)",
                  transition: ".18s",
                }}
              />
            </button>
          </div>
        </div>

        <div className="modal-foot">
          {editing ? (
            <button
              className="btn ghost"
              style={{ flex: 1, color: confirmDel ? "var(--red)" : undefined }}
              onClick={remove}
            >
              <Icon.warn /> {confirmDel ? t("confirmDelete") : t("deleteExpense")}
            </button>
          ) : (
            <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>
              {t("cancel")}
            </button>
          )}
          <button
            className="btn gold"
            style={{
              flex: 2,
              opacity: valid && !pending ? 1 : 0.45,
              pointerEvents: valid && !pending ? "auto" : "none",
            }}
            onClick={submit}
          >
            {pending ? <Spinner /> : <Icon.check />} {t("saveExpense")}
          </button>
        </div>
      </div>
    </div>
  );
}
