# Marketing Tusk Healthcare

Marketing Tusk Healthcare website. The approved brand, service scopes, starting prices and contact details are implemented.

## Website

- Homepage and nine service pages, with a grouped services hub.
- Twenty-two sector pages and a searchable, filterable directory.
- Three resource pages with branded PDFs and email-gated downloads.
- Four complete articles, a filterable blog hub and related content.
- Contextual audit, project, guidance and resource forms.
- Contact, privacy, terms, utility pages and a custom 404.
- Owner-only enquiry inbox at `/studio`, including status updates and CSV export.

Contact: Healthcare@marketingtusk.com and +91 8920-382016.

## Implementation

The application is a standard Next.js App Router project, deployed on Vercel. Durable enquiry storage uses MySQL (Drizzle ORM and `mysql2`), and is expected to run on a MySQL server hosted outside Vercel. Original brand assets are retained under `public/brand`.

Content lives in `content/site.json`, with form rules and fixed organization/service registries beside it. `components/pages.tsx` contains reusable page templates. Approved prices are content, not inferred at runtime. The resource files and their private registry are outside the public asset directory. Only first-page preview images are public.

Enquiries are validated server-side and encrypted with AES-256-GCM. Requests receive a reference only after durable database acceptance. A retry with the same request and idempotency key reuses its record; changing the payload returns a conflict. Rate limiting uses a keyed IP digest rather than a raw IP address. Hidden conditional answers are removed server-side. B2B/clinical scope mismatches are routed for manual scoping.

Downloads require a signed, expiring grant plus the matching saved resource request. PDFs are stored in the private registry in `content/resource-files.json`; raw file addresses are not public. Resource access does not subscribe a visitor to marketing updates.

`proxy.ts` replaces the previous Cloudflare Worker wrapper. It adds private cache hints and `X-Robots-Tag: noindex` for review, owner and utility routes. The public site stays noindex until launch is explicitly enabled.

## Owner inbox, editorial workspace and sign-in

The inbox, editorial workspace, draft guides and inbox APIs require a valid signed owner session.

- Sign in at `/studio/login` with `ADMIN_PASSWORD`.
- The session is stored in an HttpOnly, SameSite=Lax signed cookie and expires after 12 hours.
- `AUTH_SECRET` signs the cookie. If it is unset, `INTAKE_ENCRYPTION_KEY` is used as a fallback.
- `/studio/access` redirects to the login page for backwards compatibility.
- There is no ChatGPT/Sites header authentication on Vercel; trusting inbound identity headers would allow spoofing.

Enquiries are available in the owner inbox. No external mail or CRM provider is configured, and the website does not claim that email notifications have been sent. The optional CRM outbox schema is retained for a later integration. Legacy marketing URLs use permanent redirects to the new structure.

Records expire after 90 days. Expired records are removed during routine request processing. Status changes archive or close a record without deleting it immediately. CSV export protects spreadsheet cells against formula injection.

## Runtime values

- `DATABASE_URL`: MySQL connection string, for example `mysql://user:password@host:3306/database`.
- `DATABASE_POOL_SIZE`: optional connection-pool size per serverless instance (default `5`).
- `DATABASE_SSL`: set to `true` when the MySQL host requires TLS.
- `DATABASE_SSL_REJECT_UNAUTHORIZED`: set to `false` only when the host uses a certificate this runtime cannot verify.
- `INTAKE_ENCRYPTION_KEY`: secret, exactly 64 hexadecimal characters. Preserve it across deployments so existing records remain readable.
- `ADMIN_PASSWORD`: the owner password for `/studio/login`.
- `AUTH_SECRET`: at least 32 random characters used to sign the owner session cookie.
- `SITE_ACCESS_MODE`: launch readiness input for search indexing only; does not authorize users.
- `SITE_REVIEW_ORIGIN`: canonical origin used while indexing is disabled.
- `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_SECRET`: reserved integration configuration; unset in this release.

Secrets belong in Vercel environment variables. Local `.env` files are ignored and are not part of source or publication archives.

## Deployment

See [the Vercel and MySQL deployment guide](DEPLOYMENT.md).

## Validation

- Production build and TypeScript checks.
- Twenty-one intake/security tests in `tests/intake.test.cjs`.
- Browser checks for all 48 planned routes, one H1 and canonical metadata per page, 937 internal links, a real 404 and private indexing controls.
- Twenty-four browser API checks covering durable requests, idempotency, validation, all three PDFs, invalid/expired grants, protected inbox access and rate limiting.
- Visual review of all nine PDF pages.
- Desktop and mobile-width browser checks for navigation, forms and key page templates.

Run the core test suite with `pnpm test`. Generate database migrations with `pnpm db:generate` and apply them with `pnpm db:migrate`. Applied migrations are immutable.

## Public launch configuration

Search indexing remains disabled until the explicit launch configuration is set. See [the launch runbook](LAUNCH.md).

Before a public launch, set the owner password and signing secret, connect the domain, update canonical/open graph URLs, enable public indexing only for approved marketing pages, and keep `/studio`, APIs, downloads and utility states private or non-indexable. Add email or CRM notifications only with real provider configuration and verified delivery handling.

### Search and AI discovery

Before public search launch the Site serves no indexable sitemap entries, disallows crawling, and sets noindex. The 24 owner-approved guides are public at `/guides`. The separate 80 guides and answers across Releases 01 to 04 retain their review status, stay out of the launch sitemap, and require owner access. The 52 field notes in `content/field-notes.json` are launch candidates connected to eight browseable topic pages, relevant services, industries and worksheets. No third-party analytics, trackers, search submissions or ownership verification have been configured.

For an explicitly authorized public launch, first approve the launch pages, verify and connect the final hostname, and verify anonymous access on the actual host. Separately configure the Vercel environment with `SEO_INDEXING=public`, `SITE_ACCESS_MODE=public` and `SEO_PUBLIC_ORIGIN=https://healthcare.marketingtusk.com`, and ensure `ADMIN_PASSWORD` and `AUTH_SECRET` are set. All three launch values are required before the application emits indexable metadata or its launch sitemap. Review drafts stay protected independently of launch configuration. Recheck HTTP status, canonical tags, robots, sitemap, consent and enquiry routing before submitting the sitemap to Search Console and Bing Webmaster Tools.
