/** Browser profile requests go to the service server. No session/client token
 * crosses this boundary; the shared authority stores the canonical profile. */
export interface KastrickProfile {
	userId: string;
	displayName: string;
	email: string | null;
	avatarSeed: string;
	avatarTone: string;
	revision: number;
}
export interface KastrickProfileReply { profile: KastrickProfile; avatarUrl: string }
export const PROFILE_UPDATED_EVENT = "kastrick-profile-updated";
async function profileRequest(init?: RequestInit): Promise<KastrickProfileReply> {
	const response = await fetch("/api/account/profile", { ...init, cache: "no-store" });
	const result = await response.json();
	if (!response.ok || result.ok !== true) throw new Error(result.message || "Couldn’t load your Kastrick profile.");
	if (!result.profile || typeof result.profile.displayName !== "string" || !Number.isSafeInteger(result.profile.revision) || typeof result.avatarUrl !== "string") throw new Error("Kastrick returned an invalid profile.");
	const avatar = new URL(result.avatarUrl);
	if (!["https:", "http:"].includes(avatar.protocol) || avatar.username || avatar.password) throw new Error("Kastrick returned an invalid avatar.");
	return { profile: result.profile, avatarUrl: avatar.href };
}
export function readKastrickProfile(signal?: AbortSignal) { return profileRequest({ signal }); }
export function updateKastrickProfile(displayName: string, avatarTone: string, expectedRevision: number) {
	return profileRequest({ method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, avatarTone, expectedRevision }) });
}
