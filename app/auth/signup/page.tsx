import { SignupForm } from "./signup-form";

type SignupSearchParams = Promise<{ next?: string | string[] }>;

export default async function SignupPage({ searchParams }: { searchParams: SignupSearchParams }) {
  const params = await searchParams;
  const nextPath = Array.isArray(params.next) ? params.next[0] : params.next;
  return (
    <main className="auth-card">
	  <div className="auth-brand"><span className="brand-mark">K</span><strong>KASTRICK | Developer Portal</strong></div>
	  <span className="kicker">Kastrick Account</span>
      <h1>Create account.</h1>
	  <p>Create one Kastrick account for Developer Portal, Engine Studio and other Kastrick services.</p>
      <SignupForm nextPath={nextPath} />
    </main>
  );
}
