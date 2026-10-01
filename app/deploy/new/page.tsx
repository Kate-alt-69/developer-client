"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function NewDeployPage() {
  const router = useRouter();
  const search = useSearchParams();
  const preset = search.get("package") ? `https://github.com/Kate-alt-69/${search.get("package")}` : "https://github.com/Kate-alt-69/mail";
  const [repo, setRepo] = useState(preset);
  return <div className="narrow">
    <section className="page-heading"><span className="kicker">Deploy</span><h1>Add a package.</h1><p>Give RBE a public repository. The server handles validation, compilation, packaging and registry publication.</p></section>
    <section className="panel form-card">
      <label htmlFor="repo">Public repository URL</label>
      <input id="repo" value={repo} onChange={e=>setRepo(e.target.value)} placeholder="https://github.com/you/package" />
      <div className="repo-note"><span>↗</span><p><strong>Public repositories only.</strong><br/>Direct archive uploads are intentionally not supported.</p></div>
      <button className="button primary wide" onClick={()=>router.push(`/deploy/live?repo=${encodeURIComponent(repo)}`)}>Validate & deploy</button>
    </section>
  </div>
}
