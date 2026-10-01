import Link from "next/link";
export default function SuccessPage(){return <main className="auth-card center"><div className="success-mark">✓</div><span className="kicker">RPX authorized</span><h1>You’re signed in.</h1><p>RPX can finish the login flow now. You can return to your terminal.</p><Link className="button ghost wide" href="/">Open developer dashboard</Link></main>}
