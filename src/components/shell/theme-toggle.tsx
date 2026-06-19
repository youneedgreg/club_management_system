"use client";

import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";

export function ThemeToggle() {
  const { theme, setTheme } = useT();
  const dark = theme !== "light";
  return (
    <button
      className="iconbtn"
      title={dark ? "Light" : "Dark"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Icon.sun /> : <Icon.moon />}
    </button>
  );
}
