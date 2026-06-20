"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { useT } from "@/components/providers";
import { authClient } from "@/lib/auth/client";

type AuthResult = { error?: { message?: string } | null } | null | undefined;

/** Themed custom sign-in / sign-up form backed by the Neon Auth (Better Auth) client. */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { t } = useT();
  const router = useRouter();
  const isSignUp = mode === "sign-up";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSuccess = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = (await (isSignUp
        ? authClient.signUp.email({ email, password, name })
        : authClient.signIn.email({ email, password }))) as AuthResult;
      if (res?.error) {
        setError(res.error.message ?? t("authError"));
        setBusy(false);
        return;
      }
      onSuccess();
    } catch {
      setError(t("authError"));
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError(null);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch {
      setError(t("authError"));
      setBusy(false);
    }
  };

  return (
    <div className="card card-pad" style={{ display: "grid", gap: 18 }}>
      <div className="row" style={{ gap: 12, alignItems: "center" }}>
        <span
          className="logo"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "radial-gradient(120% 120% at 30% 20%, #2a2a32, #111114)",
            border: "1px solid var(--gold-line)",
          }}
        >
          <Icon.star style={{ width: 20, height: 20, color: "var(--gold)" }} />
        </span>
        <div>
          <div style={{ fontFamily: "var(--disp)", fontWeight: 600, fontSize: 18 }}>
            {isSignUp ? t("signUp") : t("welcomeBack")}
          </div>
          <div className="muted" style={{ fontSize: 12.5 }}>
            {isSignUp ? t("signUpSubtitle") : t("signInSubtitle")}
          </div>
        </div>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        {isSignUp && (
          <Field
            label={t("fullName")}
            type="text"
            value={name}
            onChange={setName}
            autoComplete="name"
            required
          />
        )}
        <Field
          label={t("email")}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label={t("password")}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
        />

        {error && (
          <div role="alert" className="num neg" style={{ fontSize: 12.5, color: "var(--red)" }}>
            {error}
          </div>
        )}

        <button className="btn gold" type="submit" disabled={busy} style={{ marginTop: 2 }}>
          {isSignUp ? t("signUp") : t("signIn")}
        </button>
      </form>

      <div
        className="muted"
        style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11.5 }}
      >
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        {t("orSeparator")}
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
      </div>

      <button className="btn ghost" type="button" onClick={google} disabled={busy}>
        {t("continueWithGoogle")}
      </button>

      <div className="muted" style={{ fontSize: 12.5, textAlign: "center" }}>
        {isSignUp ? t("haveAccount") : t("noAccountYet")}{" "}
        <Link
          href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}
          style={{ color: "var(--gold)", fontWeight: 600 }}
        >
          {isSignUp ? t("signIn") : t("signUp")}
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        style={{
          background: "var(--surface-2, rgba(255,255,255,0.04))",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: "10px 12px",
          color: "var(--text)",
          fontSize: 14,
          outline: "none",
        }}
      />
    </label>
  );
}
