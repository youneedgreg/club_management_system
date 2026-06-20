"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Toast } from "@/components/bs";

type ToastVariant = "success" | "error";
type ToastFn = (msg: string, variant?: ToastVariant) => void;
const ToastContext = createContext<ToastFn | null>(null);

/** Trigger a transient toast (auto-dismisses; ~2.2s success, ~4s error). */
export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ msg: string; variant: ToastVariant } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback<ToastFn>((msg, variant = "success") => {
    setState({ msg, variant });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState(null), variant === "error" ? 4000 : 2200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {state && <Toast msg={state.msg} variant={state.variant} />}
    </ToastContext.Provider>
  );
}
