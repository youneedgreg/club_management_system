"use client";

import { useState, useTransition } from "react";
import { adjustStockAction } from "@/app/(app)/stock/actions";
import { Seg } from "@/components/bs";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { useToast } from "@/components/shell/toast";
import { softBg } from "@/lib/format";
import { CAT } from "@/lib/meta";
import type { ProductRow } from "@/server/services";

type Mode = "delivery" | "count" | "adjustment";

/** Receive a delivery, set an absolute count, or post a signed correction. */
export function AdjustForm({ product, onClose }: { product: ProductRow; onClose: () => void }) {
  const { t } = useT();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>("delivery");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  // Adjustment allows a leading minus; delivery/count are non-negative.
  const clean = (v: string) =>
    mode === "adjustment"
      ? v.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, "")
      : v.replace(/[^0-9]/g, "");
  const n = Math.round(Number(qty) || 0);

  const newOnHand =
    mode === "delivery"
      ? product.onHand + Math.abs(n)
      : mode === "count"
        ? Math.max(0, n)
        : Math.max(0, product.onHand + n);

  const meta = CAT[product.category];
  const label =
    mode === "delivery" ? t("unitsReceived") : mode === "count" ? t("countedQty") : t("change");
  const valid = qty.trim().length > 0 && (mode !== "delivery" || n > 0) && !Number.isNaN(n);

  const submit = () => {
    if (!valid || pending) return;
    startTransition(async () => {
      const res = await adjustStockAction(product.id, {
        type: mode,
        qty: n,
        note: note.trim() || null,
      });
      if (res.ok) {
        toast(t("stockUpdated"));
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
            <span className="ic" style={{ background: softBg(meta.c), color: meta.c }}>
              <Icon.truck style={{ width: 17, height: 17 }} />
            </span>
            <div>
              <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 17 }}>
                {t("adjustStock")}
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                {product.name}
              </div>
            </div>
          </div>
          <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose}>
            <Icon.close />
          </button>
        </div>

        <div className="modal-body">
          <Seg
            value={mode}
            onChange={(m: Mode) => {
              setMode(m);
              setQty("");
            }}
            options={[
              { k: "delivery", label: t("receiveDelivery") },
              { k: "count", label: t("manualCount") },
              { k: "adjustment", label: t("adjustment") },
            ]}
          />

          <div className="field">
            <label>{label}</label>
            <input
              className="input num"
              autoFocus
              inputMode="numeric"
              placeholder={mode === "count" ? String(product.onHand) : "0"}
              value={qty}
              onChange={(e) => setQty(clean(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>

          <div className="field">
            <label>{t("note")}</label>
            <input
              className="input"
              placeholder={t("note")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="between" style={{ fontSize: 13 }}>
            <span className="muted">
              {t("currentStock")}:{" "}
              <span className="num" style={{ color: "var(--text)", fontWeight: 700 }}>
                {product.onHand}
              </span>{" "}
              {product.unit}
            </span>
            <span className="row" style={{ gap: 8 }}>
              <Icon.chevRight style={{ width: 14, height: 14, color: "var(--faint)" }} />
              <span className="num" style={{ fontWeight: 700, color: meta.c }}>
                {newOnHand} {product.unit}
              </span>
            </span>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>
            {t("cancel")}
          </button>
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
