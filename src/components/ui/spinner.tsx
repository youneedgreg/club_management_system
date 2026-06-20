import type { CSSProperties } from "react";

/**
 * Reusable inline spinner. Inherits `currentColor`, so set color via the parent
 * (e.g. inside a `.btn`). Server-safe (no hooks) — usable in `loading.tsx`.
 */
export function Spinner({
  size = 16,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={`spin${className ? ` ${className}` : ""}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Centered full-area loader for route `loading.tsx` and async sections. */
export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Spinner size={26} style={{ color: "var(--gold)" }} />
      {label ? (
        <span className="muted" style={{ fontSize: 13 }}>
          {label}
        </span>
      ) : null}
    </div>
  );
}
