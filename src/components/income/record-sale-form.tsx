"use client";

import { useState, useTransition } from "react";
import { recordSaleAction } from "@/app/(app)/income/actions";
import { Seg } from "@/components/bs";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { useToast } from "@/components/shell/toast";
import { DATA } from "@/lib/data";
import { softBg } from "@/lib/format";

type Pay = "mpesa" | "cash" | "card";
const toInt = (s: string): number => Math.round(Number(s) || 0);

/** Record a bar sale; picking a product depletes its stock and sets the price. */
export function RecordSaleForm({
  products,
  staff,
  onClose,
}: {
  products: { id: string; name: string; sell: number; unit: string }[];
  staff: { id: string; name: string }[];
  onClose: () => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const [location, setLocation] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [pay, setPay] = useState<Pay>("mpesa");
  const [staffId, setStaffId] = useState("");

  const product = products.find((p) => p.id === productId) ?? null;

  const pickProduct = (id: string) => {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      setDescription((d) => d || p.name);
      setAmount(String(p.sell * (toInt(qty) || 1)));
    }
  };
  const changeQty = (v: string) => {
    const clean = v.replace(/[^0-9]/g, "");
    setQty(clean);
    if (product) setAmount(String(product.sell * (toInt(clean) || 0)));
  };

  const valid = toInt(amount) > 0 && (description.trim().length > 0 || productId !== "");

  const submit = () => {
    if (!valid || pending) return;
    startTransition(async () => {
      const res = await recordSaleAction({
        location: location.trim() || null,
        description: description.trim() || null,
        amount: toInt(amount),
        paymentMethod: pay,
        staffId: staffId || null,
        productId: productId || null,
        qty: productId ? toInt(qty) || 1 : 0,
      });
      if (res.ok) {
        toast(t("saleRecorded"));
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
              style={{ background: softBg("var(--green)"), color: "var(--green)" }}
            >
              <Icon.income style={{ width: 17, height: 17 }} />
            </span>
            <div>
              <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 17 }}>
                {t("recordSale")}
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

          <div className="cols2">
            <div className="field">
              <label>{t("location")}</label>
              <input
                className="input"
                placeholder="Table 7"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("paymentMethod")}</label>
              <Seg
                value={pay}
                onChange={setPay}
                options={[
                  { k: "mpesa", label: t("mpesa") },
                  { k: "cash", label: t("cash") },
                  { k: "card", label: t("card") },
                ]}
              />
            </div>
          </div>

          <div className="field">
            <label>{t("description")}</label>
            <input
              className="input"
              placeholder={t("description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>

          <div className="cols2">
            <div className="field">
              <label>{t("product")}</label>
              <select
                className="input"
                value={productId}
                onChange={(e) => pickProduct(e.target.value)}
              >
                <option value="">{t("none")}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {productId ? (
              <div className="field">
                <label>{t("quantity")}</label>
                <input
                  className="input num"
                  inputMode="numeric"
                  placeholder="1"
                  value={qty}
                  onChange={(e) => changeQty(e.target.value)}
                />
              </div>
            ) : (
              <div className="field">
                <label>{t("staffMember")}</label>
                <select
                  className="input"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                >
                  <option value="">{t("none")}</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {productId && staff.length > 0 && (
            <div className="field">
              <label>{t("staffMember")}</label>
              <select
                className="input"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
              >
                <option value="">{t("none")}</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            {pending ? <Spinner /> : <Icon.check />} {t("recordSale")}
          </button>
        </div>
      </div>
    </div>
  );
}
