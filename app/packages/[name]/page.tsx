import Link from "next/link";
import { DownloadChart } from "@/components/download-chart";
import { versions } from "@/lib/mock-data";

export default async function PackagePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <>
    <section className="page-heading split">
      <div><div className="title-line"><h1>{name}</h1><span className="status healthy">Healthy</span></div><p>Rust · Public · github.com/Kate-alt-69/{name}</p></div>
      <div className="button-row"><a className="button ghost" href={`/api/packages/${name}/latest/download`}>↓ Download .rbe.zip</a><Link className="button primary" href={`/deploy/new?package=${name}`}>Publish new version</Link></div>
    </section>
    <section className="stats-grid compact"><div className="mini-stat"><strong>18,294</strong><span>downloads</span></div><div className="mini-stat"><strong>7</strong><span>versions</span></div><div className="mini-stat"><strong>14</strong><span>index events</span></div><div className="mini-stat"><strong>184</strong><span>latest revision</span></div></section>
    <section className="panel chart-panel"><div className="panel-head"><h2>Downloads</h2><div className="segmented"><button>7d</button><button className="selected">30d</button><button>90d</button><button>All</button></div></div><DownloadChart /></section>
    <div className="two-col package-detail">
      <section className="panel"><div className="panel-head"><h2>Versions</h2></div>{versions.map(v => <div className="version-row" key={v.version}><div><strong>{v.version}</strong>{v.badge && <span className="tiny-badge">{v.badge}</span>}</div><span>{v.downloads.toLocaleString()} downloads</span><span>{v.date}</span><button className="icon-button">↓</button></div>)}</section>
      <section className="panel"><div className="panel-head"><h2>Registry history</h2></div><div className="history"><div><b>rev 184</b><span>Published {name}@0.4.2</span></div><div><b>rev 181</b><span>Published {name}@0.4.1</span></div><div><b>rev 177</b><span>Deprecated {name}@0.2.x</span></div><div><b>rev 176</b><span>Published {name}@0.4.0</span></div></div></section>
    </div>
  </>
}
