# Deploy on Vercel with hosted MySQL

This project is a standard Next.js 16 application. Vercel detects it automatically; no Cloudflare Worker, Wrangler file or D1 binding is used.

## 1. Provision MySQL

Use MySQL 8.0 or newer on a host outside Vercel. Create a database and a dedicated application user:

```sql
CREATE DATABASE marketing_tusk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'marketing_tusk_app'@'%' IDENTIFIED BY '<strong-password>';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES
  ON marketing_tusk.* TO 'marketing_tusk_app'@'%';
FLUSH PRIVILEGES;
```

The application needs normal DML rights at runtime. The broader schema rights are only needed while running migrations. If you prefer to apply migrations from your machine, you can grant the runtime user only `SELECT, INSERT, UPDATE, DELETE`.

### TLS

Most hosted MySQL providers require TLS:

- Set `DATABASE_SSL=true`.
- If the provider uses a CA that the Vercel Node runtime cannot verify, also set `DATABASE_SSL_REJECT_UNAUTHORIZED=false`.
- Prefer the provider CA certificate when possible instead of disabling verification.

## 2. Create the tables

From this repository, add the connection string to a local `.env.local` file:

```bash
DATABASE_URL=mysql://marketing_tusk_app:<password>@<host>:3306/marketing_tusk
```

Then run:

```bash
pnpm install
pnpm db:generate   # only needed after changing db/schema.ts
pnpm db:migrate
```

The generated MySQL migration lives in `drizzle/`. Applied migrations are immutable; create a new migration for later schema changes.

## 3. Import the project into Vercel

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Next.js** (detected automatically).
4. Install command: `pnpm install`.
5. Build command: `pnpm build`.
6. Output directory: leave empty (Next.js default).
7. Node.js version: **22.x** or newer.

## 4. Add environment variables

Add these to Production (and Preview if you want preview deployments to work) in **Project → Settings → Environment Variables**:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection string. URL-encode special characters in the password. |
| `INTAKE_ENCRYPTION_KEY` | Yes | Exactly 64 hex characters. Preserve the value used by any existing deployment. |
| `ADMIN_PASSWORD` | Yes | Long, unique owner password for `/studio/login`. |
| `AUTH_SECRET` | Yes | At least 32 random characters. Signs the owner session cookie. |
| `DATABASE_POOL_SIZE` | No | Defaults to `5`. Keep small for serverless. |
| `DATABASE_SSL` | No | Set `true` if the MySQL host requires TLS. |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | No | Set `false` only when certificate verification is impossible. |
| `SITE_ACCESS_MODE` | Yes | `owner-private` until launch, then `public`. |
| `SITE_REVIEW_ORIGIN` | No | Canonical origin while indexing is off. Defaults to `https://healthcare.marketingtusk.com`. |
| `SEO_INDEXING` | No | `public` only after launch approval. |
| `SEO_PUBLIC_ORIGIN` | No | Required with `SEO_INDEXING=public`; must be the final HTTPS origin. |
| `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_SECRET` | No | Reserved; records are queued but not delivered in this release. |

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the same command for `INTAKE_ENCRYPTION_KEY` and `AUTH_SECRET` (two separate runs).

## 5. Connect the domain

1. Add `healthcare.marketingtusk.com` in **Project → Settings → Domains**.
2. Create the DNS records Vercel shows at your DNS provider.
3. Wait for HTTPS to become active.
4. Set `SEO_PUBLIC_ORIGIN=https://healthcare.marketingtusk.com` only when the domain is live.

## 6. Verify the deployment

- Open the public pages and submit a test audit, consultation and resource request.
- Sign in at `/studio/login`, check the inbox record, change its status and export the CSV.
- Download one resource PDF and try an expired or edited download link.
- Confirm `/studio` shows the owner sign-in prompt for a signed-out visitor, and `/studio/access` redirects to `/studio/login`.
- Confirm `/robots.txt`, `/sitemap.xml` and canonical URLs use the intended origin.

## Operational notes

- **Connection limits:** each Vercel serverless instance keeps its own small pool. If the MySQL provider has a low connection limit, keep `DATABASE_POOL_SIZE` at `2–5` and consider a provider connection proxy.
- **Migrations:** run them deliberately from CI or your machine. Do not make every deployment race to alter the schema.
- **Backups:** enable automated backups and point-in-time recovery at the MySQL provider.
- **Key rotation:** rotating `INTAKE_ENCRYPTION_KEY` makes existing encrypted enquiry payloads unreadable. Rotating `AUTH_SECRET` only signs owners out; existing records remain readable.
- **Secrets:** never commit `.env`, `.env.local` or `.env*.local`.
- **Old Cloudflare resources:** after cutover, remove the old Cloudflare deployment and D1 database once you have exported anything you still need.
