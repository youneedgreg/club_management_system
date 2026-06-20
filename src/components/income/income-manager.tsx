"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  CardTitle,
  Donut,
  Legend,
  Money,
  Page,
  Progress,
  Seg,
  Stat,
  WeekBars,
} from "@/components/bs";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { RecordSaleForm } from "@/components/income/record-sale-form";
import { DATA } from "@/lib/data";
import { moneyK } from "@/lib/format";
import { CAT, PAY } from "@/lib/meta";

export type IncomeChart =
  | { kind: "bars"; data: { h: string; v: number; label: string }[] }
  | { kind: "week"; data: { day: string; rev: number; cost: number; tonight?: boolean }[] };

type Range = "tonight" | "week" | "month";

export interface IncomeManagerProps {
  range: Range;
  rangeTotal: number;
  chart: IncomeChart;
  income: number;
  footfall: number;
  tablesOpen: number;
  transactions: number;
  avg: number;
  bottles: number;
  categories: { key: string; amount: number }[];
  paymentMix: { method: string; pct: number; amount: number }[];
  feed: {
    id: string;
    time: string;
    location: string | null;
    description: string | null;
    paymentMethod: string;
    amount: number;
  }[];
  products: { id: string; name: string; sell: number; unit: string }[];
  staff: { id: string; name: string }[];
}

const chipClass = (m: string): string => (m === "mpesa" ? "mpesa" : m === "card" ? "blue" : "gold");

export function IncomeManager(props: IncomeManagerProps) {
  const { t } = useT();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const { range, chart, paymentMix, categories, feed } = props;
  const maxCat = Math.max(1, ...categories.map((c) => c.amount));
  const chartTitle =
    range === "week" ? t("thisWeek") : range === "month" ? t("thisMonth") : t("salesByHour");

  return (
    <Page>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <span className="chip gold">
          <Icon.calendar style={{ width: 13, height: 13 }} /> {DATA.meta.night} · {t("live")}
        </span>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Seg
            value={range}
            onChange={(k: Range) => router.push(k === "tonight" ? "/income" : `/income?range=${k}`)}
            options={[
              { k: "tonight", label: t("tonight") },
              { k: "week", label: t("thisWeek") },
              { k: "month", label: t("thisMonth") },
            ]}
          />
          <button className="btn gold sm" onClick={() => setShowForm(true)}>
            <Icon.plus /> {t("recordSale")}
          </button>
        </div>
      </div>

      <div className="cols4">
        <div className="card card-pad">
          <Stat
            label={t("grossSales")}
            icon="income"
            color="var(--green)"
            value={props.rangeTotal}
            size={26}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("transactions")}
            icon="receipt"
            color="var(--gold)"
            value={props.transactions}
            cur={false}
            size={26}
            foot={props.tablesOpen + " " + t("tablesOpen").toLowerCase()}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("avgSpend")}
            icon="users"
            color="var(--blue)"
            value={props.avg}
            size={26}
          />
        </div>
        <div className="card card-pad">
          <Stat
            label={t("bottlesSold")}
            icon="bottle"
            color="var(--violet)"
            value={props.bottles}
            cur={false}
            size={26}
          />
        </div>
      </div>

      <div className="split">
        <div className="card card-pad">
          <CardTitle icon="trendUp" color="var(--green)" title={chartTitle} />
          {chart.kind === "week" ? (
            <WeekBars data={chart.data} h={150} />
          ) : (
            <BarChart data={chart.data} color="var(--green)" h={150} />
          )}
        </div>
        <div className="card card-pad">
          <CardTitle icon="wallet" color="var(--mpesa)" title={t("byPaymentMethod")} />
          <div className="row" style={{ gap: 16 }}>
            <Donut
              data={paymentMix.map((p) => ({ value: p.amount, color: PAY[p.method].c }))}
              size={116}
              thickness={15}
              center={
                <div>
                  <div className="num" style={{ fontSize: 13, fontWeight: 700 }}>
                    {moneyK(props.income)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--faint)" }}>{t("total")}</div>
                </div>
              }
            />
            <div style={{ flex: 1 }}>
              <Legend
                data={paymentMix.map((p) => ({
                  label: t(p.method),
                  value: DATA.meta.currency + " " + moneyK(p.amount),
                  color: PAY[p.method].c,
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="split-r">
        <div className="card card-pad">
          <CardTitle icon="stock" color="var(--gold)" title={t("byCategory")} />
          <div className="stack" style={{ gap: 14 }}>
            {categories.map((c) => (
              <div key={c.key}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <span className="row" style={{ gap: 8, fontSize: 13, fontWeight: 600 }}>
                    <span
                      className="dotled"
                      style={{ background: CAT[c.key]?.c ?? "var(--gold)" }}
                    />
                    {t(c.key)}
                  </span>
                  <span className="num dimt" style={{ fontSize: 13 }}>
                    <Money v={c.amount} />
                  </span>
                </div>
                <Progress
                  value={c.amount}
                  max={maxCat}
                  color={CAT[c.key]?.c ?? "var(--gold)"}
                  h={6}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <CardTitle icon="receipt" color="var(--gold)" title={t("transactions")} />
          {feed.length === 0 ? (
            <div className="muted" style={{ fontSize: 13, padding: "18px 2px" }}>
              {t("noSalesYet")}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t("time")}</th>
                    <th>{t("item")}</th>
                    <th className="hide-mobile">{t("paymentMethod")}</th>
                    <th style={{ textAlign: "end" }}>{t("amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.map((s) => (
                    <tr key={s.id}>
                      <td className="num muted">{s.time}</td>
                      <td>
                        <div className="r-name">{s.description ?? "—"}</div>
                        <div className="r-sub">{s.location ?? "—"}</div>
                      </td>
                      <td className="hide-mobile">
                        <span className={"chip " + chipClass(s.paymentMethod)}>
                          {t(s.paymentMethod)}
                        </span>
                      </td>
                      <td style={{ textAlign: "end" }}>
                        <span className="num pos" style={{ fontWeight: 700 }}>
                          +<Money v={s.amount} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <RecordSaleForm
          products={props.products}
          staff={props.staff}
          onClose={() => setShowForm(false)}
        />
      )}
    </Page>
  );
}
