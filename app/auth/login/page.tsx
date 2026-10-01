import { LoginForm } from "./login-form";

type LoginSearchParams = Promise<{ next?: string | string[] }>;

export default async function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
  const params = await searchParams;
  const nextPath = Array.isArray(params.next) ? params.next[0] : params.next;
  return (
    <main className="auth-card">
      <div className="auth-brand"><span className="brand-mark">R</span><strong>RBE Developer</strong></div>
      <span className="kicker">Developer account</span>
      <h1>Sign in.</h1>
      <p>Use your global UAC email and password to manage packages, deployments and RPX access.</p>
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
