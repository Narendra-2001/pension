# Pension

A modern React starter for pension and retirement planning apps.

## Stack

- **React 19 + Vite** — fast dev server and production builds
- **TypeScript** — type-safe components and data
- **Tailwind CSS v4** — utility-first styling
- **@tailwindcss/typography** — rich prose content styling
- **TanStack Query** — server state and async data
- **TanStack Router** — typed client routing
- **shadcn/ui** — accessible UI primitives (`Button` included)
- **GSAP** — timeline and scroll animations
- **Framer Motion** — declarative UI motion

## Getting started

```bash
cd ~/Desktop/pension
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Add more shadcn components

If the shadcn CLI is available on your machine:

```bash
npx shadcn@latest add card input
```

## Project structure

```
src/
  components/ui/   # shadcn/ui components
  lib/             # shared utilities
  pages/           # route page components
  providers/       # React context providers
  router.tsx       # TanStack Router setup
```

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build       |
| `npm run preview` | Preview production build |
