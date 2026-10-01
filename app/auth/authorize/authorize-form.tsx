"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../auth.module.css";

function messageFor(error: string): string {
  if (error === "invalid_session") return "Your Developer Portal session expired. Sign in again.";
  if (error === "invalid_user_code") return "That RPX authorization code is invalid or expired.";
  if (error === "device_code_expired") return "This RPX login request expired. Run rpx login again.";
  if (error === "device_already_approved") return "This RPX login request was already approved by another account.";
  if (error === "rpx_auth_unavailable") return "RPX authorization is temporarily unavailable.";
  return "Could not authorize RPX. Run rpx login again if the request has expired.";
}

export function AuthorizeForm({ userCode }: { userCode: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function authorize() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/rpx/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userCode }),
      });
      const result = await response.json() as { ok?: boolean; approved?: boolean; error?: string };
      if (!response.ok || result.ok !== true || result.approved !== true) {
        setError(messageFor(result.error || "authorization_failed"));
        return;
      }
      router.replace("/auth/success");
      router.refresh();
    } catch {
      setError("Could not reach RPX authorization. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="scope-box">
        <strong>RPX will be able to</strong>
        <span>✓ Identify your developer account</span>
        <span>✓ List packages you own</span>
        <span>✓ Publish releases for allowed packages</span>
        <span>✓ Manage your own package releases</span>
      </div>
      <div className="signed-in">
        Request code <strong>{userCode}</strong>
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className="button-row auth-actions">
        <Link className="button ghost" href="/dash">Cancel</Link>
        <button className="button primary" type="button" disabled={busy} onClick={() => void authorize()}>
          {busy ? "Authorizing…" : "Authorize RPX"}
        </button>
      </div>
    </>
  );
}
