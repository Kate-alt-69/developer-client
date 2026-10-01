"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "../auth.module.css";

function messageFor(error: string): string {
  if (error === "invalid_credentials") return "Email or password is incorrect.";
  if (error === "rate_limited") return "Too many sign-in attempts. Try again in a moment.";
  if (error === "invalid_email") return "Enter a valid email address.";
  if (error === "invalid_password") return "Password must be at least 8 characters.";
  if (error === "uac_unavailable") return "Developer authentication is temporarily unavailable.";
  return "Could not sign in. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || result.ok !== true) {
        setError(messageFor(result.error || "authentication_failed"));
        return;
      }
      router.replace("/dash");
      router.refresh();
    } catch {
      setError("Could not reach Developer authentication. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        disabled={busy}
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
        disabled={busy}
      />
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button className="button primary wide" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className={styles.footer}>New here? <Link href="/auth/signup">Create a developer account</Link></p>
    </form>
  );
}
