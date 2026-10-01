import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="auth-card">
      <div className="auth-brand"><span className="brand-mark">R</span><strong>RBE Developer</strong></div>
      <span className="kicker">Developer account</span>
      <h1>Create account.</h1>
      <p>Register a Developer Portal identity for publishing packages, deployments and RPX authorization.</p>
      <SignupForm />
    </main>
  );
}
