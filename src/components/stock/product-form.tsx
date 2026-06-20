"use client";

import { useState, useTransition } from "react";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/(app)/stock/actions";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { useToast } from "@/components/shell/toast";
import { money, softBg } from "@/lib/format";
import { CAT } from "@/lib/meta";
import type { ProductRow } from "@/server/services";

const CATEGORIES = ["spirits", "beer", "wine", "soft", "shisha", "cigarettes"] as const;
type Category = (typeof CATEGORIES)[number];

const toInt = (s: string): number => Math.round(Number(s) || 0);

/** Add (no `product`) or edit a stock item. On-hand is only set when adding. */
export function ProductForm({
  suppliers,
  product,
  onClose,
}: {
  suppliers: { id: string; name: string }[];
  product?: ProductRow | null;
  onClose: () => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const editing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<Category>((product?.category as Category) ?? "spirits");
  const [unit, setUnit] = useState(product?.unit ?? "btl");
  const [cost, setCost] = useState(product ? String(product.cost) : "");
  const [sell, setSell] = useState(product ? String(product.sell) : "");
  const [par, setPar] = useState(product ? String(product.par) : "");
  const [onHand, setOnHand] = useState(product ? String(product.onHand) : "");
  const [supplierId, setSupplierId] = useState(product?.supplierId ?? "");
  const [deliveredAt, setDeliveredAt] = useState(product?.deliveredAt ?? "");
  const [confirmDel, setConfirmDel] = useState(false);

  const remove = () => {
    if (!product || pending) return;
    if (!confirmDel) {
      setConfirmDel(true);
      return;
    }
    startTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (res.ok) {
        toast(t("itemDeleted"));
        onClose();
      } else {
        toast(res.error ?? t("somethingWentWrong"), "error");
      }
    });
  };

  const margin = toInt(sell) - toInt(cost);
  const valid = name.trim().length > 0 && unit.trim().length > 0;

  const submit = () => {
    if (!valid || pending) return;
    const base = {
      name: name.trim(),
      category,
      unit: unit.trim(),
      par: toInt(par),
      cost: toInt(cost),
      sell: toInt(sell),
      supplierId: supplierId || null,
      deliveredAt: deliveredAt || null,
    };
    startTransition(async () => {
      const res = editing
        ? await updateProductAction(product!.id, base)
        : await createProductAction({ ...base, onHand: toInt(onHand) });
      if (res.ok) {
        toast(editing ? t("itemUpdated") : t("itemAdded"));
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
            <span
              className="ic"
              style={{ background: softBg(CAT[category].c), color: CAT[category].c }}
            >
              <Icon.stock style={{ width: 17, height: 17 }} />
            </span>
            <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 17 }}>
              {editing ? t("editItem") : t("addItem")}
            </div>
          </div>
          <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose}>
            <Icon.close />
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>{t("productName")}</label>
            <input
              className="input"
              autoFocus
              placeholder={t("productName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>{t("category")}</label>
            <div className="cat-grid">
              {CATEGORIES.map((c) => {
                const m = CAT[c];
                const on = category === c;
                const I = Icon[m.ic];
                return (
                  <button
                    key={c}
                    type="button"
                    className={"cat-opt " + (on ? "on" : "")}
                    style={on ? { background: softBg(m.c), color: m.c } : undefined}
                    onClick={() => setCategory(c)}
                  >
                    <I style={{ width: 18, height: 18 }} />
                    <span>{t(c)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cols2">
            <div className="field">
              <label>{t("unit")}</label>
              <input
                className="input"
                placeholder="btl"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("supplier")}</label>
              <select
                className="input"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">{t("none")}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cols2">
            <div className="field">
              <label>{t("cost")}</label>
              <input
                className="input num"
                inputMode="numeric"
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <div className="field">
              <label>{t("sellPrice")}</label>
              <input
                className="input num"
                inputMode="numeric"
                placeholder="0"
                value={sell}
                onChange={(e) => setSell(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>

          <div className="between" style={{ fontSize: 12.5 }}>
            <span className="muted">{t("margin")}</span>
            <span
              className="num"
              style={{ fontWeight: 700, color: margin >= 0 ? "var(--green)" : "var(--red)" }}
            >
              {margin >= 0 ? "+" : "−"}
              {money(Math.abs(margin))}
            </span>
          </div>

          <div className="cols2">
            <div className="field">
              <label>{t("parLevel")}</label>
              <input
                className="input num"
                inputMode="numeric"
                placeholder="0"
                value={par}
                onChange={(e) => setPar(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            {editing ? (
              <div className="field">
                <label>{t("lastDelivery")}</label>
                <input
                  className="input"
                  type="date"
                  value={deliveredAt}
                  onChange={(e) => setDeliveredAt(e.target.value)}
                />
              </div>
            ) : (
              <div className="field">
                <label>{t("currentStock")}</label>
                <input
                  className="input num"
                  inputMode="numeric"
                  placeholder="0"
                  value={onHand}
                  onChange={(e) => setOnHand(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
            )}
          </div>
        </div>

        <div className="modal-foot">
          {editing ? (
            <button
              className="btn ghost"
              style={{ flex: 1, color: confirmDel ? "var(--red)" : undefined }}
              onClick={remove}
            >
              <Icon.warn /> {confirmDel ? t("confirmDelete") : t("deleteItem")}
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
            {pending ? <Spinner /> : <Icon.check />} {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
