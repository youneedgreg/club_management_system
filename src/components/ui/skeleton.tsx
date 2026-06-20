import type { CSSProperties } from "react";

/**
 * Shimmering placeholder block for loading states. Server-safe (no hooks) so it
 * works in `loading.tsx`. Size with `w`/`h` (number → px, or any CSS length);
 * `r` sets the corner radius. Decorative — hidden from assistive tech.
 */
export function Skeleton({
  w = "100%",
  h = 12,
  r,
  className,
  style,
}: {
  w?: number | string;
  h?: number | string;
  r?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{ width: w, height: h, ...(r !== undefined && { borderRadius: r }), ...style }}
      aria-hidden="true"
    />
  );
}
