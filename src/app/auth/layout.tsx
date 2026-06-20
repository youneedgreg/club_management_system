import type { ReactNode } from "react";

/** Minimal centered shell for the auth pages (outside the app chrome). */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 384 }}>{children}</div>
    </div>
  );
}
