import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEVELOPER_SESSION_COOKIE,
  resolveDeveloperSession,
} from "@/lib/uac";
import { AuthorizeForm } from "./authorize-form";

type AuthorizeSearchParams = Promise<{
  code?: string | string[];
}>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function normalizeCode(value: string): string | undefined {
  const normalized = value.replace(/[-\s]/g, "").toUpperCase();
  if (!/^[0-9A-F]{16}$/.test(normalized)) return undefined;
  return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12)}`;
}

export default async function AuthorizePage({ searchParams }: { searchParams: AuthorizeSearchParams }) {
  const params = await searchParams;
  const code = normalizeCode(first(params.code));

  if (!code) {
    return (
      <main className="auth-card authorize">
        <div className="auth-brand"><span className="brand-mark">R</span><strong>RBE Developer</strong></div>
        <span className="kicker">RPX authorization</span>
        <h1>Invalid login request.</h1>
        <p>Run <code>rpx login</code> again to create a fresh authorization code.</p>
      </main>
    );
  }

  const authorizePath = `/auth/authorize?code=${encodeURIComponent(code)}`;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(DEVELOPER_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    redirect(`/auth/login?next=${encodeURIComponent(authorizePath)}`);
  }

  try {
    const session = await resolveDeveloperSession(sessionToken);
    if (session.body.ok !== true) {
      redirect(`/auth/login?next=${encodeURIComponent(authorizePath)}`);
    }
  } catch {
    return (
      <main className="auth-card authorize">
        <div className="auth-brand"><span className="brand-mark">R</span><strong>RBE Developer</strong></div>
        <span className="kicker">RPX authorization</span>
        <h1>Authentication unavailable.</h1>
        <p>The Developer Portal could not verify your UAC session. Try again in a moment.</p>
      </main>
    );
  }

  return (
    <main className="auth-card authorize">
      <div className="auth-brand"><span className="brand-mark">R</span><strong>RBE Developer</strong></div>
      <span className="kicker">RPX authorization</span>
      <h1>Authorize RPX?</h1>
      <p>A CLI on your device wants scoped access to this Developer Portal account.</p>
      <div className="signed-in">Developer Portal session verified through global UAC.</div>
      <AuthorizeForm userCode={code} />
    </main>
  );
}
