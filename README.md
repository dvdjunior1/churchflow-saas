# Churchflow SaaS

[cloudflarebutton]

A production-ready full-stack SaaS application template built on Cloudflare Workers. Features a modern React frontend with Tailwind CSS and shadcn/ui components, powered by a Hono backend with Durable Objects for scalable, stateful entities like users and chat boards.

## Features

- **Full-Stack Architecture**: React SPA frontend with Cloudflare Workers backend using Hono routing.
- **Durable Objects**: Efficient entity storage and indexing for users, chats, and messages (extensible via `worker/entities.ts`).
- **Modern UI**: Responsive design with Tailwind CSS, shadcn/ui components, dark mode, animations, and theme toggle.
- **State Management**: TanStack Query for data fetching, React Router for navigation, Zustand/Immer for local state.
- **Real-Time Ready**: Built-in support for chat messaging with low-latency Durable Objects.
- **Type-Safe**: End-to-end TypeScript with shared types in `@/shared`.
- **Production Optimized**: Error boundaries, client error reporting, CORS, health checks, and Cloudflare observability.
- **Developer Experience**: Hot reload, Bun scripts, Vite bundling, ESLint/TypeScript linting.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, Lucide icons, Framer Motion, Sonner toasts, React Hook Form, TanStack Query.
- **Backend**: Hono, Cloudflare Workers, Durable Objects (SQLite-backed).
- **Data**: Shared TypeScript types, Indexed entities for listing/pagination.
- **Tools**: Bun (package manager), Wrangler (deployment), TypeScript 5, ESLint.

## Quick Start

1. **Prerequisites**:
   - [Bun](https://bun.sh/) installed.
   - [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/installation/) logged in: `wrangler login`.

2. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd churchflow-saas-jqp5snmlu9n6u1yrbw0lz
   bun install
   ```

3. **Development**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (or `$PORT`).

4. **Type Generation** (for Workers env types):
   ```bash
   bun cf-typegen
   ```

## Development

- **Frontend**: Edit `src/` files. Hot reloads automatically.
- **Backend Routes**: Add routes in `worker/user-routes.ts`. Core utils in `worker/core-utils.ts` (do not modify).
- **Entities**: Extend `worker/entities.ts` using `IndexedEntity` base class.
- **API Client**: Use `api()` from `@/lib/api-client.ts` for type-safe fetches.
- **Linting**:
  ```bash
  bun lint
  ```
- **Build**:
  ```bash
  bun build
  ```
- **Preview**:
  ```bash
  bun preview
  ```

### API Examples

All APIs return `{ success: boolean; data?: T; error?: string }`.

```typescript
// List users (paginated)
const { items: users, next } = await api<{ items: User[]; next: string | null }>('/api/users?limit=10');

// Create chat
const chat = await api<Chat>('/api/chats', { method: 'POST', body: JSON.stringify({ title: 'New Chat' }) });

// Send message
const message = await api<ChatMessage>('/api/chats/c1/messages', {
  method: 'POST',
  body: JSON.stringify({ userId: 'u1', text: 'Hello!' })
});
```

Health check: `GET /api/health`.

## Deployment

Deploy to Cloudflare Workers with zero-config:

```bash
bun deploy
```

This builds the frontend assets, bundles the worker, and deploys via Wrangler.

[cloudflarebutton]

**Custom Domain**: Update `wrangler.jsonc` and run `wrangler deploy`.

**Environment Variables**: Set via Wrangler dashboard or `wrangler secret put <NAME>`.

**Migrations**: Durable Objects auto-migrate on deploy (see `wrangler.jsonc`).

## Customization

- **Remove Demo Sidebar**: Delete `AppLayout` usage or `src/components/app-sidebar.tsx`.
- **Replace HomePage**: Edit `src/pages/HomePage.tsx`.
- **Add Pages**: Update `src/main.tsx` router.
- **Seed Data**: Edit `shared/mock-data.ts` and `worker/entities.ts`.
- **Theme/UI**: Customize `tailwind.config.js` and `src/index.css`.

## Support

- Cloudflare Workers Docs: [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers)
- Issues: Open a GitHub issue.
- License: MIT (template boilerplate).