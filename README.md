# RBE Developer Client

Focused developer-facing UI for the RBE package registry.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Vercel

Import the repository into Vercel as a Next.js project. No special build configuration is required for this UI prototype.

## Current prototype routes

- `/` overview + analytics
- `/packages` package list
- `/packages/mail` package detail + `.rbe.zip` download actions
- `/deploy/new` public repository entry
- `/deploy/live` real-time-style validation/publish pipeline prototype
- `/security` RPER/security state
- `/sessions` RPX CLI sessions

The deploy pipeline currently simulates streamed stages until the Kastrick backend endpoint is connected. Download links intentionally point at future `/api/packages/.../download` endpoints.

## Backend connection

Set `RBE_API_BASE` in Vercel to the canonical Kastrick backend URL. The website download routes will redirect package downloads to the backend registry endpoint.
