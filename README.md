# RBE Developer Client

Developer-facing RBE package portal for public package discovery, RPX workflows, deployments, package settings, release automation, and package security.

## Routes

- `/` — public landing page
- `/explore` — public package explorer backed by the Kastrick RPX index
- `/packages/[name]` — public package page with RPX usage and direct `.rbe.zip` downloads
- `/dash` — developer dashboard
- `/dash/packages` — owned packages
- `/dash/deployments` — deployment history
- `/dash/new-package` — connect a new public Git repository
- `/dash/[package]` — package dashboard
- `/dash/[package]/deployments` — package deploy history
- `/dash/[package]/releases` — immutable release history
- `/dash/[package]/setting` — build, source, metadata, and Git-trigger automation settings

## Backend

Defaults to:

```text
https://kastrick-backend.onrender.com
```

Override with `RBE_API_BASE` or `NEXT_PUBLIC_RBE_API_BASE`.

The public Explorer first requests the live RPX package index and falls back to preview data if the backend is unavailable.

## Development

```powershell
npm install
npm run dev
```

## Product links

- Kastrick: https://kastrick.vercel.app
- Engine Studio: https://ne-studio.vercel.app
