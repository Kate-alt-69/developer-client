"use client";
import { useEffect, useId, useRef, useState } from "react";
import { PROFILE_UPDATED_EVENT, readKastrickProfile, updateKastrickProfile, type KastrickProfileReply } from "@/lib/ka-profile";
import styles from "./KastrickProfile.module.css";

/** Refresh on focus/visibility and while visible, without replacing an owner's
 * unsaved draft. The draft retains its original revision for conflict checking. */
export function KastrickProfileEditor() {
	const id = useId();
	const [account, setAccount] = useState<KastrickProfileReply | null>(null);
	const [name, setName] = useState(""); const [tone, setTone] = useState("violet");
	const [busy, setBusy] = useState(false); const [message, setMessage] = useState("Loading your Kastrick profile…");
	const dirty = useRef(false); const saving = useRef(false); const draftRevision = useRef(0);
	const refreshRef = useRef<(force?: boolean) => Promise<void>>(async () => {});
	useEffect(() => {
		const controller = new AbortController(); let refreshing = false;
		async function refresh(force = false) {
			if (saving.current || refreshing) return;
			refreshing = true;
			try {
				const body = await readKastrickProfile(controller.signal);
				if (controller.signal.aborted || saving.current) return;
				setAccount(body);
				if (!dirty.current || force) { setName(body.profile.displayName); setTone(body.profile.avatarTone); draftRevision.current = body.profile.revision; dirty.current = false; setMessage(force ? "Profile refreshed." : ""); }
			} catch (error) { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Couldn’t refresh your profile."); }
			finally { refreshing = false; }
		}
		refreshRef.current = refresh;
		const update = () => { if (!document.hidden) void refresh(); };
		void refresh(); window.addEventListener("focus", update); window.addEventListener(PROFILE_UPDATED_EVENT, update); document.addEventListener("visibilitychange", update);
		const timer = window.setInterval(update, 30000);
		return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", update); window.removeEventListener(PROFILE_UPDATED_EVENT, update); document.removeEventListener("visibilitychange", update); };
	}, []);
	async function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault(); if (saving.current) return; saving.current = true; setBusy(true);
		try {
			const body = await updateKastrickProfile(name, tone, draftRevision.current);
			setAccount(body); setName(body.profile.displayName); setTone(body.profile.avatarTone); draftRevision.current = body.profile.revision; dirty.current = false;
			setMessage("Profile saved across Kastrick. Other services refresh it when you return to them."); window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
		} catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t save your profile."); }
		finally { saving.current = false; setBusy(false); }
	}
	function reload() {
		if (dirty.current && !window.confirm("Replace unsaved edits with your current Kastrick profile?")) return;
		void refreshRef.current(true);
	}
	return (
		<section className={styles.profile} aria-labelledby={`${id}-title`}>
			<header>{account ? <img src={account.avatarUrl} width="48" height="48" alt="Generated account avatar" /> : null}<div><h3 id={`${id}-title`}>Kastrick Account</h3><p>{account?.profile.email || "One profile across Kastrick services."}</p></div></header>
			<form onSubmit={event => void save(event)}>
				<label htmlFor={`${id}-name`}>Display name</label><input id={`${id}-name`} value={name} onChange={event => { dirty.current = true; setName(event.target.value); }} maxLength={80} required disabled={busy || !account} autoComplete="nickname" />
				<label htmlFor={`${id}-tone`}>Generated avatar color</label><select id={`${id}-tone`} value={tone} onChange={event => { dirty.current = true; setTone(event.target.value); }} disabled={busy || !account}><option value="violet">Violet</option><option value="cyan">Cyan</option><option value="rose">Rose</option><option value="amber">Amber</option></select>
				<button type="submit" disabled={busy || !account}>{busy ? "Saving…" : "Save Kastrick profile"}</button><button type="button" disabled={busy} onClick={reload}>Refresh profile</button>
			</form>
			{message ? <p role="status">{message}</p> : null}
			<a href="/api/account/manage" target="_blank" rel="noopener noreferrer">Manage connected services &amp; storage ↗</a>
		</section>
	);
}
export function KastrickProfileBadge() {
	const [account, setAccount] = useState<KastrickProfileReply | null>(null);
	useEffect(() => {
		const controller = new AbortController(); let refreshing = false;
		async function refresh() { if (refreshing || document.hidden) return; refreshing = true; try { const body = await readKastrickProfile(controller.signal); if (!controller.signal.aborted) setAccount(body); } catch { /* The service's existing session UI owns authentication failures. */ } finally { refreshing = false; } }
		void refresh(); window.addEventListener("focus", refresh); window.addEventListener(PROFILE_UPDATED_EVENT, refresh); document.addEventListener("visibilitychange", refresh); const timer = window.setInterval(refresh, 30000);
		return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener(PROFILE_UPDATED_EVENT, refresh); document.removeEventListener("visibilitychange", refresh); };
	}, []);
	return <span className={styles.badge}>{account ? <img src={account.avatarUrl} width="24" height="24" alt="" /> : null}<span>{account?.profile.displayName || "Kastrick Account"}</span></span>;
}
