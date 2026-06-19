"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { I18N, LOCALES } from "@/lib/i18n";

export function LangSwitch() {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="lang-wrap" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen((o) => !o)}>
        <Icon.globe className="glb" />
        <span>{I18N[lang]._native}</span>
        <Icon.chevDown className="car" />
      </button>
      {open && (
        <div className="lang-menu">
          {LOCALES.map((l) => (
            <button
              key={l}
              className={"lang-opt " + (lang === l ? "on" : "")}
              onClick={() => {
                setLang(l);
                setOpen(false);
              }}
            >
              <span className="fl">{I18N[l]._flag}</span>
              <span>
                <div className="nat">{I18N[l]._native}</div>
                <div className="en">{I18N[l]._name}</div>
              </span>
              {lang === l && <Icon.check className="ck" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
