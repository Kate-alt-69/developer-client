import { LoginForm } from "./login-form";

type LoginSearchParams = Promise<{ next?: string | string[]; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
  const params = await searchParams;
  const nextPath = Array.isArray(params.next) ? params.next[0] : params.next;
  return (
    <main className="auth-card">
	  <div className="auth-brand"><span className="brand-mark">K</span><strong>KASTRICK | Developer Portal</strong></div>
	  <span className="kicker">Kastrick Account</span>
      <h1>Sign in.</h1>
	  <p>Use your Kastrick account to manage packages, deployments and RPX access.</p>
			{params.error ? <p role="status">{params.error === "cancelled" ? "Sign-in cancelled. Connect whenever you’re ready." : "We couldn’t complete your connection. Start sign-in again."}</p> : null}
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
