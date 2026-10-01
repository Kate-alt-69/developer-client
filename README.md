# RBE Developer Client

Focused developer-facing UI for RBE package publishing, analytics, Security/RPER notices, RPX authorization and deployment inspection.

## Stack

- Next.js 16
- React 19
- TypeScript
- No UI framework dependency
- Vercel-ready

## Canonical services

- Kastrick backend: `https://kastrick-backend.onrender.com`
- Kastrick main site: `https://kastrick.vercel.app`
- Engine Studio: `https://ne-studio.vercel.app`

Copy `.env.example` to `.env.local` when developing locally.

## Run

```powershell
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Route model

Package pages are slug-based:

```text
/packages/mail
/packages/advancenet
/packages/<slug>
```

Unknown packages return a package-specific 404 page.

Deployment inspection uses a stable query-based URL:

```text
/deploy?account=<publicID>&deployid=<deploymentID>
```

Special deployment ID:

```text
/deploy?account=pub_kate_69&deployid=latest
```

`latest` resolves the newest visible deployment for that public account ID.

The prototype also includes a failure demo:

```text
/deploy?account=pub_kate_69&deployid=dpl_fail_demo
```

The deploy inspector currently simulates live pipeline events. It is structured to be replaced by the real Kastrick backend deployment stream later.

## Package artifacts

Website download actions route through:

```text
/api/packages/<name>/latest/download
/api/packages/<name>/<version>/download
```

and redirect to the configured Kastrick backend package download endpoint.
