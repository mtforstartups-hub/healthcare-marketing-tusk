# Marketing Tusk Healthcare launch runbook

## Release scope

Launch the marketing site first: the service and sector directories, nine service pages, 22 sectors, enquiry paths, seven resources, four existing articles and 52 field notes, subject to final copy approval. The eight topic hubs link to the field notes. The enabled sitemap is designed to contain 133 URLs. The 24 owner-approved guides and their directory are included in the public release. The separate 80 guides and answers across Releases 01 to 04 remain owner review material and are excluded from the sitemap. The editorial register is at /studio/editorial.

## Sequence and owners

| Step | Owner | What must be verified |
| --- | --- | --- |
| 1. Correct the existing access configuration | Sites owner | Existing platform URL is currently public, while the prior runtime uses owner-private trust. If prelaunch content should be private, restrict the old version to owner-only now. Approve deployment of the candidate, provision the site-scoped ADMIN_USER_ID using /studio/access, preserve the existing intake encryption key and verify anonymous and non-owner accounts cannot read, export or modify inbox data or access drafts and covers. |
| 2. Connect the primary domain | DNS and Sites owners | Attach healthcare.marketingtusk.com to the existing project. Use only the DNS records Sites returns. Confirm HTTPS and the intended routing on the real hostname. Keep indexing disabled until the release and domain are approved. |
| 3. Approve the marketing release | Marketing Tusk owner | Check brand, published service scopes and starting prices, phone, inbox address, public claims, privacy and terms. Review the 52 field notes for the initial release. Confirm which pages should be public. |
| 4. Prove lead handling | Sales and web teams | Submit synthetic audit, project, guidance and resource requests from the final domain; check acknowledgements and branches, a successful PDF download, and every test record in the owner inbox. Assign a primary and backup owner and a reply target. The current website saves records to the inbox; no email or CRM delivery is configured. If alerts are needed at launch, choose a destination and test actual delivery. |
| 5. Verify the public experience | Web and editorial teams | Check homepage, service and sector templates, blog and resources on mobile and desktop; verify keyboard navigation, key contact links, form recovery, redirects and 404s. Capture the previous deployed version ID and a rollback decision owner. |
| 6. Enable discovery | SEO owner | With signed approval, the real public hostname and tested owner protections, set SITE_ACCESS_MODE=public, SEO_INDEXING=public and SEO_PUBLIC_ORIGIN=https://healthcare.marketingtusk.com. Verify the homepage and sample pages are accessible anonymously, canonical tags use the final host, robots and the sitemap are correct, and review routes stay excluded. Verify Search Console and Bing Webmaster Tools, submit the sitemap and monitor initial coverage. |

## Guide release record

The site owner approved all 24 guides on 6 November 2026. The review package’s provisional dates and original review notes are retained in the owner register. Withheld sources are excluded from the public reading lists. Any future updates should be reviewed against the sources and final content revision.

Optional after the basics: add consent-appropriate measurement, an alert or CRM integration, and run a small audit outreach batch before sending at scale.
