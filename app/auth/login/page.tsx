import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="auth-card">
      <div className="auth-brand"><span className="brand-mark">R</span><strong>RBE Developer</strong></div>
      <span className="kicker">Developer account</span>
      <h1>Sign in.</h1>
      <p>Use your Developer Portal email and password to manage packages, deployments and RPX access.</p>
      <LoginForm />
    </main>
  );
}
