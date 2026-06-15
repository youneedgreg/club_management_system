/* Black Stars — shared primitives, charts, formatters, i18n context. */
const { createContext, useContext, useState, useEffect, useRef } = React;

/* ---- i18n context (value supplied by app.jsx) ---- */
const I18nContext = createContext(null);
const useT = () => useContext(I18nContext);

/* ---- formatters ---- */
const money = (n) => Math.round(n).toLocaleString("en-US");
const moneyK = (n) => {
  const a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.0+$/, "") + "M";
  if (a >= 1e3) return Math.round(n / 1e3) + "k";
  return "" + Math.round(n);
};
const softBg = (c) => `color-mix(in srgb, ${c} 15%, transparent)`;

/* ---- category / payment / role meta ---- */
const CAT = {
  spirits: { c: "var(--gold)", ic: "bottle" },
  beer:    { c: "var(--blue)", ic: "beer" },
  wine:    { c: "var(--violet)", ic: "bottle" },
  shisha:  { c: "var(--green)", ic: "smoke" },
  soft:    { c: "#5fd0c4", ic: "bottle" },
  cigarettes: { c: "#c3bba9", ic: "smoke" },
  door:    { c: "var(--gold-2)", ic: "door" },
};
const PAY = {
  mpesa: { c: "var(--mpesa)", ic: "wallet" },
  cash:  { c: "var(--gold)", ic: "cash" },
  card:  { c: "var(--blue)", ic: "card" },
};
const ECAT = {
  suppliers: { c: "var(--blue)", ic: "truck" },
  wages: { c: "var(--gold)", ic: "users" },
  entertainment: { c: "var(--violet)", ic: "music" },
  rentLicense: { c: "#5fd0c4", ic: "pin" },
  security: { c: "var(--red)", ic: "shield" },
  utilities: { c: "var(--green)", ic: "bolt" },
  misc: { c: "#c3bba9", ic: "receipt" },
};
const ROLE = {
  supervisor: "var(--gold)", cashier: "var(--blue)", bartender: "var(--green)",
  waiter: "#5fd0c4", securityRole: "var(--red)", dj: "var(--violet)",
};
const avatarColor = (name) => {
  const cols = ["#ecbb4e", "#6aa6ff", "#3fd6a0", "#b591ff", "#ff8f6f", "#5fd0c4", "#54c265"];
  let s = 0; for (const ch of name) s += ch.charCodeAt(0);
  return cols[s % cols.length];
};
const initials = (name) => name.split(/[\s—]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

/* ---- small components ---- */
const Money = ({ v, cur = true, cls = "" }) => {
  const { t } = useT();
  return <span className={"num " + cls}>{cur && <span className="cur">{DATA.meta.currency}</span>}{money(v)}</span>;
};

const Delta = ({ v, suffix }) => {
  const up = v >= 0;
  const I = up ? Icon.arrowUp : Icon.arrowDown;
  return <span className={"delta " + (up ? "up" : "down")}><I /> {up ? "+" : ""}{v}%{suffix ? " " + suffix : ""}</span>;
};

const IcChip = ({ name, color, size = 38, r = 11 }) => {
  const I = Icon[name] || Icon.dots;
  return <span style={{ width: size, height: size, borderRadius: r, display: "grid", placeItems: "center",
    background: softBg(color), color, flex: "0 0 auto" }}><I style={{ width: size * 0.5, height: size * 0.5 }} /></span>;
};

const CardTitle = ({ icon, color = "var(--gold)", title, more, onMore }) => (
  <div className="card-title">
    {icon && <span className="ic" style={{ background: softBg(color), color }}>{React.createElement(Icon[icon], { style: { width: 17, height: 17 } })}</span>}
    <h3>{title}</h3>
    {more && <button className="more" onClick={onMore}>{more} <Icon.chevRight /></button>}
  </div>
);

const SectionH = ({ children }) => (
  <div className="sec-h"><h2>{children}</h2><span className="ln" /></div>
);

const Stat = ({ label, icon, color = "var(--gold)", value, cur = true, size = 30, delta, foot }) => (
  <div className="stat">
    <div className="lab">{icon && <IcChip name={icon} color={color} size={26} r={8} />}{label}</div>
    <div className="val" style={{ fontSize: size }}><Money v={value} cur={cur} /></div>
    <div className="row" style={{ marginTop: 10, gap: 8 }}>
      {delta !== undefined && <Delta v={delta} />}
      {foot && <span className="muted" style={{ fontSize: 12 }}>{foot}</span>}
    </div>
  </div>
);

const Progress = ({ value, max, color = "var(--gold)", h = 7 }) => (
  <div className="bar" style={{ height: h }}>
    <i style={{ width: Math.min(100, (value / max) * 100) + "%", background: color }} />
  </div>
);

/* ---- Donut ---- */
const Donut = ({ data, size = 132, thickness = 16, center }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = (size - thickness) / 2, C = 2 * Math.PI * R;
  let off = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(140,135,125,.22)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={R} fill="none" stroke={d.color}
            strokeWidth={thickness} strokeDasharray={`${Math.max(len - 3, 0)} ${C - Math.max(len - 3, 0)}`}
            strokeDashoffset={-off} strokeLinecap="round" />;
          off += len; return el;
        })}
      </svg>
      {center && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>{center}</div>}
    </div>
  );
};

const Legend = ({ data, fmt }) => (
  <div className="legend">
    {data.map((d, i) => (
      <div className="lg" key={i}>
        <span className="dotled" style={{ background: d.color }} />
        <span className="nm">{d.label}</span>
        <span className="vv">{fmt ? fmt(d.value) : d.value}</span>
      </div>
    ))}
  </div>
);

/* ---- Vertical bar chart (by hour) ---- */
const BarChart = ({ data, color = "var(--gold)", peakKey, h = 130, fmt }) => {
  const max = Math.max(...data.map(d => d.v)) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: h }}>
      {data.map((d, i) => {
        const isPeak = peakKey ? d.h === peakKey : d.v === max;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: isPeak ? "var(--gold-2)" : "var(--faint)" }} className="num hide-mobile">{fmt ? fmt(d.v) : d.v}</div>
            <div style={{ width: "100%", maxWidth: 30, height: `${(d.v / max) * 100}%`, minHeight: 4, borderRadius: "6px 6px 3px 3px",
              background: isPeak ? "linear-gradient(180deg,var(--gold-2),var(--gold))" : softBg(color),
              border: isPeak ? "none" : `1px solid ${softBg(color)}`, transition: ".3s" }} />
            <div style={{ fontSize: 10.5, color: "var(--faint)", fontWeight: 600 }}>{d.h}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ---- Grouped rev/cost bars (weekly) ---- */
const WeekBars = ({ data, h = 150 }) => {
  const { t } = useT();
  const max = Math.max(...data.map(d => Math.max(d.rev, d.cost))) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: h }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: "100%", width: "100%", justifyContent: "center" }}>
            <div title="rev" style={{ width: 10, height: `${(d.rev / max) * 100}%`, minHeight: 3, borderRadius: "4px 4px 0 0", background: "linear-gradient(180deg,var(--green),#2a9d77)" }} />
            <div title="cost" style={{ width: 10, height: `${(d.cost / max) * 100}%`, minHeight: 3, borderRadius: "4px 4px 0 0", background: "var(--red-soft)", border: "1px solid rgba(255,111,111,.4)" }} />
          </div>
          <div style={{ fontSize: 11, color: d.tonight ? "var(--gold-2)" : "var(--faint)", fontWeight: d.tonight ? 700 : 600 }}>{d.day}</div>
        </div>
      ))}
    </div>
  );
};

/* ---- Line / area sparkline ---- */
const Spark = ({ data, color = "var(--gold)", w = 320, h = 70 }) => {
  const max = Math.max(...data) , min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, h - 6 - ((v - min) / rng) * (h - 14) ]);
  const line = pts.map(p => p.join(",")).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const id = "g" + Math.round(Math.random() * 1e6);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {pts.slice(-1).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color} />)}
    </svg>
  );
};

const Seg = ({ options, value, onChange }) => (
  <div className="seg">
    {options.map(o => <button key={o.k} className={value === o.k ? "on" : ""} onClick={() => onChange(o.k)}>{o.label}</button>)}
  </div>
);

const Toast = ({ msg }) => (
  <div className="toast"><Icon.checkCircle /> {msg}</div>
);

const Grid = ({ min = 240, gap = 16, children, style }) => (
  <div style={{ display: "grid", gap, gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, ...style }}>{children}</div>
);

/* page wrapper with entrance + title block */
const Page = ({ children }) => <div className="fade-pg stack">{children}</div>;

Object.assign(window, {
  I18nContext, useT, money, moneyK, softBg, CAT, PAY, ECAT, ROLE, avatarColor, initials,
  Money, Delta, IcChip, CardTitle, SectionH, Stat, Progress, Donut, Legend, BarChart, WeekBars, Spark, Seg, Toast, Grid, Page,
});
