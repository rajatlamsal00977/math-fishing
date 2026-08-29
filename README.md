# Math Fishing Game

A cozy 2D top-down fishing game for K–5 math practice, built with Phaser 3 +
Vite + TypeScript. Solo submission for the Nerdy AI Hackathon (target: Sep 18).

- Full product/design plan: [PLAN.md](./PLAN.md)
- Build checklist / progress: [TASKS.md](./TASKS.md)

## Dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

Claude API calls are proxied through Vercel serverless functions in `/api` —
the API key never ships to the client. Copy `.env.example` to `.env.local` and
fill in `ANTHROPIC_API_KEY` once Phase 2 wires up the API routes.
