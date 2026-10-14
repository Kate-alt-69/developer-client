"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../app/auth/auth.module.css";

/** Credential entry is rendered by the shared Kastrick account authority,
 * with an explicit Developer Portal connection after the user signs in. */
export function KastrickLogin({ mode, nextPath }: { mode: "login" | "signup"; nextPath?: string }) {
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	async function start() {
		if (busy) return;
		setBusy(true);
		setMessage("");
		try {
			const response = await fetch("/api/account/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, next: nextPath }) });
			const body = await response.json();
			if (!response.ok || body.ok !== true || typeof body.authorizationUrl !== "string") throw new Error(body.message || "Couldn’t open Kastrick sign-in.");
			setBusy(false);
			window.location.assign(body.authorizationUrl);
		} catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t open Kastrick sign-in."); setBusy(false); }
	}
	const other = mode === "login" ? "/auth/signup" : "/auth/login";
	return (
		<div className={styles.form}>
			<button type="button" className="button primary wide" onClick={() => void start()} disabled={busy}>{busy ? "Opening Kastrick…" : mode === "signup" ? "Create Kastrick account →" : "Continue with Kastrick →"}</button>
			{message ? <p role="status" className={styles.error}>{message}</p> : null}
			<p className={styles.hint}>Use one Kastrick account across services. This sign-in connects only Developer Portal.</p>
			<Link href={nextPath ? `${other}?next=${encodeURIComponent(nextPath)}` : other}>{mode === "login" ? "Need an account? Create one" : "Already have a Kastrick account? Sign in"}</Link>
		</div>
	);
}
