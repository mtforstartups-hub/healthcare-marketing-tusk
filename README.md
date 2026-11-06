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

The retained M2 source used a standalone Node server and local SQLite. Sites hosts Worker applications, so this build adapts the same durable intake, encryption, origin checking and idempotency patterns to the supported Vinext, D1 and R2 runtime. Original brand assets are retained under `public/brand`.

Content lives in `content/site.json`, with form rules and fixed organization/service registries beside it. `components/pages.tsx` contains reusable page templates. Approved prices are content, not inferred at runtime. The resource files and their private registry are outside the public asset directory. Only first-page preview images are public.

Enquiries are validated server-side and encrypted with AES-256-GCM. Requests receive a reference only after durable database acceptance. A retry with the same request and idempotency key reuses its record; changing the payload returns a conflict. Rate limiting uses a keyed IP digest rather than a raw IP address. Hidden conditional answers are removed server-side. B2B/clinical scope mismatches are routed for manual scoping.

Downloads require a signed, expiring grant plus the matching saved resource request. The server stores and reads PDFs through R2; raw file addresses are not public. Resource access does not subscribe a visitor to marketing updates.

## Owner inbox and notifications

The inbox, editorial workspace, draft guides, and inbox APIs require an exact match to the site-scoped `ADMIN_USER_ID`. Sign-in or an audience setting alone cannot grant owner access. Use `/studio/access` while signed in as the site owner to retrieve the correct ID.

Enquiries are available in the owner inbox. No external mail or CRM provider is configured, and the website does not claim that email notifications have been sent. The optional CRM outbox schema is retained for a later integration. Legacy marketing URLs use permanent redirects to the new structure.

Records expire after 90 days. Expired records are removed during routine request processing. Status changes archive or close a record without deleting it immediately. CSV export protects spreadsheet cells against formula injection.

## Runtime values

- `INTAKE_ENCRYPTION_KEY`: secret, exactly 64 hexadecimal characters. Preserve it across deployments so existing records remain readable.
- `SITE_ACCESS_MODE`: launch readiness input for search indexing only; does not authorize users.
- `ADMIN_USER_ID`: required to access owner routes regardless of Site audience. Use the actual owner identity for this Site, never an inferred ID.
- `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_SECRET`: reserved integration configuration; unset in this release.

Secrets belong in Sites runtime configuration. Local `.dev.vars` files are ignored and are not part of source or publication archives.

## Validation

- Production build and TypeScript checks.
- Twenty-one intake/security tests in `tests/intake.test.cjs`.
- Browser checks for all 48 planned routes, one H1 and canonical metadata per page, 937 internal links, a real 404 and private indexing controls.
- Twenty-four browser API checks covering durable requests, idempotency, validation, all three PDFs, invalid/expired grants, protected inbox access and rate limiting.
- Visual review of all nine PDF pages.
- Desktop and mobile-width browser checks for navigation, forms and key page templates.

Run the core test suite with `node scripts/check-intake.mjs`. Generate database migrations with `npm run db:generate`; applied migrations are immutable. Use the Sites helpers for builds and publishing.

## Public launch configuration

The Sites audience is public. Search indexing remains disabled until the explicit launch configuration is set. See [the launch runbook](LAUNCH.md).

Before a public launch, configure the exact owner administrator ID, change `SITE_ACCESS_MODE` so the server enforces that administrator allowlist, connect the domain and update canonical/open graph URLs, enable public indexing only for approved marketing pages, and keep `/studio`, APIs, downloads and utility states private or non-indexable. Use Sites access controls to change the audience. Add email or CRM notifications only with real provider configuration and verified delivery handling.

### Search and AI discovery

Before public search launch the Site serves no indexable sitemap entries, disallows crawling, and sets noindex. The 24 owner-approved guides are public at `/guides`. The separate 80 guides and answers across Releases 01 to 04 retain their review status, stay out of the launch sitemap, and require owner access. The 52 field notes in `content/field-notes.json` are launch candidates connected to eight browseable topic pages, relevant services, industries and worksheets. No third-party analytics, trackers, search submissions or ownership verification have been configured.

For an explicitly authorized public launch, first approve the launch pages, verify and connect the final hostname, and verify anonymous access on the actual host. Separately configure the application environment with `SEO_INDEXING=public`, `SITE_ACCESS_MODE=public` and `SEO_PUBLIC_ORIGIN=https://healthcare.marketingtusk.com`, and ensure the owner inbox's `ADMIN_USER_ID` is correctly set. All three values are required before the application emits indexable metadata or its launch sitemap. Review drafts stay protected independently of launch configuration. Recheck HTTP status, canonical tags, robots, sitemap, consent and enquiry routing before submitting the sitemap to Search Console or Bing Webmaster Tools.
