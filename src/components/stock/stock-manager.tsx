"use client";

import { useState } from "react";
import { CardTitle, IcChip, Money, Page, Progress, Seg, Stat } from "@/components/bs";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { useToast } from "@/components/shell/toast";
import { AdjustForm } from "@/components/stock/adjust-form";
import { ProductForm } from "@/components/stock/product-form";
import { softBg } from "@/lib/format";
import { CAT } from "@/lib/meta";
import type { ProductRow } from "@/server/services";

const CATEGORIES = ["spirits", "beer", "wine", "soft", "shisha", "cigarettes"] as const;

const dateLabel = (iso: string): string =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

type FormState = { mode: "add" } | { mode: "edit"; product: ProductRow } | null;

export function StockManager({
  products,
  suppliers,
}: {
  products: ProductRow[];
  suppliers: { id: string; name: string }[];
}) {
  const { t } = useT();
  const toast = useToast();
  const [cat, setCat] = useState<string>("all");
  const [form, setForm] = useState<FormState>(null);
  const [adjust, setAdjust] = useState<ProductRow | null>(null);

  const stockValue = products.reduce((s, p) => s + p.onHand * p.cost, 0);
  const low = products.filter((p) => p.low).sort((a, b) => a.ratio - b.ratio);
  const cats = CATEGORIES.filter((c) => products.some((p) => p.category === c));
  const rows = cat === "all" ? products : products.filter((p) => p.category === cat);
  const lastDelivery = products
    .filter((p) => p.deliveredAt)
    .reduce<ProductRow | null>(
      (best, p) => (best === null || p.deliveredAt! > best.deliveredAt! ? p : best),
      null,
    );

  return (
    <Page>
      <div className="cols4">
        <div className="card card-pad">
          <Stat
            label={t("stockValue")}
            icon="stock"
            color="var(--gold)"
            value={stockValue}
            size={26}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("itemsLow")}
            icon="warn"
            color="var(--red)"
            value={low.length}
            cur={false}
            size={26}
            foot={t("needsReorder")}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label="SKUs"
            icon="bottle"
            color="var(--blue)"
            value={products.length}
            cur={false}
            size={26}
            foot={cats.length + " " + t("categories").toLowerCase()}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("lastDelivery")}
            icon="truck"
            color="var(--green)"
            value={lastDelivery?.deliveredAt ? dateLabel(lastDelivery.deliveredAt) : "—"}
            cur={false}
            size={22}
            foot={lastDelivery?.supplierName ?? undefined}
          />
        </div>
      </div>

      {low.length > 0 && (
        <div
          className="card card-pad"
          style={{
            borderColor: "rgba(255,111,111,.28)",
            background: "linear-gradient(120deg, rgba(255,111,111,.07), var(--surface) 55%)",
          }}
        >
          <div className="between" style={{ marginBottom: 14 }}>
            <div className="row">
              <IcChip name="warn" color="var(--red)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t("reorderSuggestions")}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {low.length} {t("itemsLow")}
                </div>
              </div>
            </div>
            <button
              className="btn gold sm"
              onClick={() => toast(t("reorderDrafted") + " · " + low.length)}
            >
              <Icon.truck /> {t("reorder")}
            </button>
          </div>
          <div className="wrap-chips">
            {low.map((s) => (
              <span className="chip red" key={s.id}>
                {s.name} · {s.onHand}/{s.par}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card card-pad">
        <div className="between" style={{ marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <CardTitle icon="stock" color="var(--gold)" title={t("barStock")} />
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <Seg
              value={cat}
              onChange={setCat}
              options={[{ k: "all", label: t("all") }, ...cats.map((c) => ({ k: c, label: t(c) }))]}
            />
            <button className="btn gold sm" onClick={() => setForm({ mode: "add" })}>
              <Icon.plus /> {t("addItem")}
            </button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("item")}</th>
                <th className="hide-mobile">{t("category")}</th>
                <th>{t("currentStock")}</th>
                <th className="hide-mobile">{t("margin")}</th>
                <th className="hide-mobile">{t("value")}</th>
                <th>{t("status")}</th>
                <th style={{ textAlign: "end" }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const m = CAT[s.category];
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="row" style={{ gap: 11 }}>
                        <IcChip name={m.ic} color={m.c} size={32} r={9} />
                        <div>
                          <div className="r-name">{s.name}</div>
                          <div className="r-sub">{s.supplierName ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <span
                        className="chip"
                        style={{ color: m.c, borderColor: softBg(m.c), background: softBg(m.c) }}
                      >
                        {t(s.category)}
                      </span>
                    </td>
                    <td style={{ minWidth: 150 }}>
                      <div className="between" style={{ marginBottom: 6 }}>
                        <span className="num" style={{ fontWeight: 700 }}>
                          <span style={{ color: s.low ? "var(--red)" : "var(--text)" }}>
                            {s.onHand}
                          </span>{" "}
                          <span className="muted" style={{ fontWeight: 500 }}>
                            / {s.par} {s.unit}
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={s.onHand}
                        max={s.par || 1}
                        color={s.low ? "var(--red)" : "var(--green)"}
                        h={5}
                      />
                    </td>
                    <td className="hide-mobile">
                      <span className="num" style={{ color: "var(--green)", fontWeight: 600 }}>
                        +<Money v={s.margin} />
                      </span>
                    </td>
                    <td className="hide-mobile">
                      <span className="num dimt">
                        <Money v={s.onHand * s.cost} />
                      </span>
                    </td>
                    <td>
                      {s.low ? (
                        <span className="chip red">{t("low")}</span>
                      ) : (
                        <span className="chip green">{t("healthy")}</span>
                      )}
                    </td>
                    <td>
                      <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                        <button
                          className="iconbtn"
                          title={t("adjustStock")}
                          style={{ width: 32, height: 32 }}
                          onClick={() => setAdjust(s)}
                        >
                          <Icon.plus />
                        </button>
                        <button
                          className="iconbtn"
                          title={t("editItem")}
                          style={{ width: 32, height: 32 }}
                          onClick={() => setForm({ mode: "edit", product: s })}
                        >
                          <Icon.settings />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <ProductForm
          suppliers={suppliers}
          product={form.mode === "edit" ? form.product : null}
          onClose={() => setForm(null)}
        />
      )}
      {adjust && <AdjustForm product={adjust} onClose={() => setAdjust(null)} />}
    </Page>
  );
}
