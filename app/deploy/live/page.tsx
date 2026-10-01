"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const stages = [
  ["Repository", "Fetching public repository and resolving HEAD"],
  ["Package", "Reading package metadata and component graph"],
  ["Validation", "Running RPX full package checks"],
  ["Compile", "Compiling declared package components"],
  ["Security", "Checking signatures, integrity and RPER state"],
  ["Package build", "Creating canonical .rbe.zip artifact"],
  ["Registry", "Hashing artifact and writing registry revision"],
];

export default function LiveDeployPage() {
  const search = useSearchParams();
  const repo = search.get("repo") || "https://github.com/Kate-alt-69/mail";
  const pkg = useMemo(()=>repo.split("/").filter(Boolean).pop()?.replace(/\.git$/,"") || "package", [repo]);
  const [step, setStep] = useState(0);
  useEffect(()=>{ if(step >= stages.length) return; const t=setTimeout(()=>setStep(s=>s+1), 850); return ()=>clearTimeout(t); },[step]);
  const done = step >= stages.length;
  return <div className="deploy-layout">
    <section className="page-heading split"><div><span className="kicker">Deploy</span><h1>{done ? `${pkg}@0.4.3 is published.` : `Publishing ${pkg}…`}</h1><p>{done ? "The release is live in the RBE package index." : "You can watch every validation and publishing stage as it happens."}</p></div>{done && <span className="success-pill">✓ Published</span>}</section>
    <section className="panel deploy-card">
      <div className="deploy-source"><span className="repo-icon">↗</span><div><strong>{repo}</strong><small>main · simulated HEAD 7c636fe</small></div></div>
      <div className="deploy-stages">{stages.map(([title,desc],i)=>{ const state=i<step?"done":i===step&&!done?"active":"pending"; return <div className={`deploy-stage ${state}`} key={title}><div className="stage-icon">{state==="done"?"✓":state==="active"?"•••":"·"}</div><div><strong>{title}</strong><span>{desc}</span>{state==="active" && <small>Working…</small>}</div></div> })}</div>
      {done && <div className="deploy-result"><div><span className="eyebrow">Release</span><strong>{pkg}@0.4.3</strong><small>Registry revision 185 · canonical artifact ready</small></div><div className="button-row"><a className="button ghost" href={`/api/packages/${pkg}/0.4.3/download`}>↓ Download .rbe.zip</a><Link className="button primary" href={`/packages/${pkg}`}>View package →</Link></div></div>}
    </section>
    <p className="simulation-note">UI prototype: deploy stages are simulated until the Kastrick backend streaming endpoint is connected.</p>
  </div>
}
