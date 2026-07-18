# E-Commerce

Next.js storefront and admin dashboard built with Bun, Tailwind CSS, shadcn/ui, and Prisma SQLite.

## Requirements

- Bun
- Node-compatible environment for Next.js

## Setup

```bash
bun install
bun run db:push
bun run db:generate
```

Create `.env` and set `DATABASE_URL`:

```env
DATABASE_URL="file:./db/custom.db"
```

Initial credentials for the one dashboard administrator. On the first successful
admin login, the app creates the single `Admin` database record and stores a
password hash. Customer accounts remain in the separate `Customer` table and
cannot access `/admin`.

```env
ADMIN_EMAIL="admin@modave.com"
ADMIN_PASSWORD="admin123"
```

Also set two session-signing secrets (the app throws at startup in production if
these are missing; a dev-only fallback is used otherwise):

```env
# Generate with: openssl rand -hex 32
ADMIN_SESSION_SECRET="..."
CUSTOMER_SESSION_SECRET="..."
```

And optionally the public site URL (used for `sitemap.xml` and product OpenGraph/canonical URLs):

```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Development

```bash
bun run dev
```

Open `http://localhost:3000`.

## Scripts

- `bun run dev` - start the development server
- `bun run build` - build the production app
- `bun run start` - run the production standalone server
- `bun run lint` - run ESLint
- `bun run db:push` - sync Prisma schema to the database
- `bun run db:generate` - generate Prisma client
- `bun run db:migrate` - create and apply a Prisma migration
- `bun run db:reset` - reset the database
