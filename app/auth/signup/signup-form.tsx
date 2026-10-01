"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "../auth.module.css";

function messageFor(error: string): string {
  if (error === "identity_conflict") return "That username is already taken.";
  if (error === "invalid_email") return "Enter a valid email address.";
  if (error === "invalid_username") return "Use 3–32 letters, numbers, dots, underscores or hyphens.";
  if (error === "invalid_password") return "Password must be at least 8 characters.";
  if (error === "signup_busy") return "Account creation is busy. Try again in a moment.";
  if (error === "rate_limited") return "Too many attempts. Try again in a moment.";
  return "Could not create the account. Please try again.";
}

export function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || result.ok !== true) {
        setError(messageFor(result.error || "signup_failed"));
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
      <label htmlFor="username">Username</label>
      <input
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        placeholder="your-name"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        minLength={3}
        maxLength={32}
        pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}"
        required
        disabled={busy}
      />
      <p className={styles.hint}>3–32 characters. Letters, numbers, dots, underscores and hyphens.</p>

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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
        disabled={busy}
      />
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button className="button primary wide" type="submit" disabled={busy}>
        {busy ? "Creating account…" : "Create developer account"}
      </button>
      <p className={styles.footer}>Already have an account? <Link href="/auth/login">Sign in</Link></p>
    </form>
  );
}
