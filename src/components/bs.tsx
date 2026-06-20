"use client";

/**
 * Black Stars — shared UI primitives & charts. Ported from the prototype
 * `ui.jsx`. Styling comes from the ported design-system classes in globals.css.
 */
import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { DATA } from "@/lib/data";
import { money, softBg } from "@/lib/format";

/* ---- Money ---- */
export function Money({ v, cur = true, cls = "" }: { v: number; cur?: boolean; cls?: string }) {
  return (
    <span className={"num " + cls}>
      {cur && <span className="cur">{DATA.meta.currency}</span>}
      {money(v)}
    </span>
  );
}

/* ---- Delta pill ---- */
export function Delta({ v, suffix }: { v: number; suffix?: string }) {
  const up = v >= 0;
  const I = up ? Icon.arrowUp : Icon.arrowDown;
  return (
    <span className={"delta " + (up ? "up" : "down")}>
      <I /> {up ? "+" : ""}
      {v}%{suffix ? " " + suffix : ""}
    </span>
  );
}

/* ---- Icon chip ---- */
export function IcChip({
  name,
  color,
  size = 38,
  r = 11,
}: {
  name: IconName;
  color: string;
  size?: number;
  r?: number;
}) {
  const I = Icon[name] || Icon.dots;
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: r,
        display: "grid",
        placeItems: "center",
        background: softBg(color),
        color,
        flex: "0 0 auto",
      }}
    >
      <I style={{ width: size * 0.5, height: size * 0.5 }} />
    </span>
  );
}

/* ---- Card title row ---- */
export function CardTitle({
  icon,
  color = "var(--gold)",
  title,
  more,
  onMore,
}: {
  icon?: IconName;
  color?: string;
  title: ReactNode;
  more?: ReactNode;
  onMore?: () => void;
}) {
  const I = icon ? Icon[icon] : null;
  return (
    <div className="card-title">
      {I && (
        <span className="ic" style={{ background: softBg(color), color }}>
          <I style={{ width: 17, height: 17 }} />
        </span>
      )}
      <h3>{title}</h3>
      {more && (
        <button className="more" onClick={onMore}>
          {more} <Icon.chevRight />
        </button>
      )}
    </div>
  );
}

/* ---- Section heading ---- */
export function SectionH({ children }: { children: ReactNode }) {
  return (
    <div className="sec-h">
      <h2>{children}</h2>
      <span className="ln" />
    </div>
  );
}

/* ---- Stat ---- */
export function Stat({
  label,
  icon,
  color = "var(--gold)",
  value,
  cur = true,
  size = 30,
  delta,
  foot,
}: {
  label: ReactNode;
  icon?: IconName;
  color?: string;
  value: number | string;
  cur?: boolean;
  size?: number;
  delta?: number;
  foot?: ReactNode;
}) {
  return (
    <div className="stat">
      <div className="lab">
        {icon && <IcChip name={icon} color={color} size={26} r={8} />}
        {label}
      </div>
      <div className="val" style={{ fontSize: size }}>
        {typeof value === "number" ? (
          <Money v={value} cur={cur} />
        ) : (
          <span className="num">{value}</span>
        )}
      </div>
      <div className="row" style={{ marginTop: 10, gap: 8 }}>
        {delta !== undefined && <Delta v={delta} />}
        {foot && (
          <span className="muted" style={{ fontSize: 12 }}>
            {foot}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---- Progress bar ---- */
export function Progress({
  value,
  max,
  color = "var(--gold)",
  h = 7,
}: {
  value: number;
  max: number;
  color?: string;
  h?: number;
}) {
  return (
    <div className="bar" style={{ height: h }}>
      <i style={{ width: Math.min(100, (value / max) * 100) + "%", background: color }} />
    </div>
  );
}

/* ---- Donut ---- */
export function Donut({
  data,
  size = 132,
  thickness = 16,
  center,
}: {
  data: { value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: ReactNode;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = (size - thickness) / 2;
  const C = 2 * Math.PI * R;
  const lens = data.map((d) => (d.value / total) * C);
  // Cumulative offset preceding each segment (no in-render mutation).
  const offsets = lens.map((_, i) => lens.slice(0, i).reduce((s, l) => s + l, 0));
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "0 0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke="rgba(140,135,125,.22)"
          strokeWidth={thickness}
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={`${Math.max(lens[i] - 3, 0)} ${C - Math.max(lens[i] - 3, 0)}`}
            strokeDashoffset={-offsets[i]}
            strokeLinecap="round"
          />
        ))}
      </svg>
      {center && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          {center}
        </div>
      )}
    </div>
  );
}

/* ---- Legend ---- */
export function Legend({
  data,
  fmt,
}: {
  data: { label: ReactNode; value: ReactNode; color: string }[];
  fmt?: (v: ReactNode) => ReactNode;
}) {
  return (
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
}

/* ---- Vertical bar chart (by hour) ---- */
export function BarChart({
  data,
  color = "var(--gold)",
  peakKey,
  h = 130,
  fmt,
}: {
  data: { h: string; v: number }[];
  color?: string;
  peakKey?: string;
  h?: number;
  fmt?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.v)) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: h }}>
      {data.map((d, i) => {
        const isPeak = peakKey ? d.h === peakKey : d.v === max;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: isPeak ? "var(--gold-2)" : "var(--faint)",
              }}
              className="num hide-mobile"
            >
              {fmt ? fmt(d.v) : d.v}
            </div>
            <div
              style={{
                width: "100%",
                maxWidth: 30,
                height: `${(d.v / max) * 100}%`,
                minHeight: 4,
                borderRadius: "6px 6px 3px 3px",
                background: isPeak
                  ? "linear-gradient(180deg,var(--gold-2),var(--gold))"
                  : softBg(color),
                border: isPeak ? "none" : `1px solid ${softBg(color)}`,
                transition: ".3s",
              }}
            />
            <div style={{ fontSize: 10.5, color: "var(--faint)", fontWeight: 600 }}>{d.h}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Grouped rev/cost bars (weekly) ---- */
export function WeekBars({
  data,
  h = 150,
}: {
  data: { day: string; rev: number; cost: number; tonight?: boolean }[];
  h?: number;
}) {
  const max = Math.max(...data.map((d) => Math.max(d.rev, d.cost))) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: h }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
              height: "100%",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <div
              title="rev"
              style={{
                width: 10,
                height: `${(d.rev / max) * 100}%`,
                minHeight: 3,
                borderRadius: "4px 4px 0 0",
                background: "linear-gradient(180deg,var(--green),#2a9d77)",
              }}
            />
            <div
              title="cost"
              style={{
                width: 10,
                height: `${(d.cost / max) * 100}%`,
                minHeight: 3,
                borderRadius: "4px 4px 0 0",
                background: "var(--red-soft)",
                border: "1px solid rgba(255,111,111,.4)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 11,
              color: d.tonight ? "var(--gold-2)" : "var(--faint)",
              fontWeight: d.tonight ? 700 : 600,
            }}
          >
            {d.day}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Line / area sparkline ---- */
export function Spark({
  data,
  color = "var(--gold)",
  w = 320,
  h = 70,
}: {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}) {
  const id = useId();
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - 6 - ((v - min) / rng) * (h - 14),
  ]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last && <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} />}
    </svg>
  );
}

/* ---- Segmented control ---- */
export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { k: T; label: ReactNode }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.k} className={value === o.k ? "on" : ""} onClick={() => onChange(o.k)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---- Toast ---- */
export function Toast({
  msg,
  variant = "success",
}: {
  msg: ReactNode;
  variant?: "success" | "error";
}) {
  return (
    <div className={`toast${variant === "error" ? "toast-error" : ""}`}>
      {variant === "error" ? <Icon.warn /> : <Icon.checkCircle />} {msg}
    </div>
  );
}

/* ---- Card ---- */
export function Card({
  children,
  style,
  className = "",
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={"card card-pad " + className} style={style}>
      {children}
    </div>
  );
}

/* ---- Page wrapper with entrance animation ---- */
export function Page({ children }: { children: ReactNode }) {
  return <div className="fade-pg stack">{children}</div>;
}
