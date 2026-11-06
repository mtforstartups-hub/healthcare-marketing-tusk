# Release validation

24 October 2026

- 48 planned routes rendered successfully, each with one H1 and a canonical URL.
- 937 internal links resolved to known routes.
- 404 handling and private indexing controls passed.
- 21 validation and cryptography tests passed.
- 24 browser request checks passed, including duplicate requests, changed-request conflicts, optional resource marketing consent, all three PDF downloads, invalid and expired grants, owner access boundaries and rate limiting.
- Audit and resource forms were submitted through their actual visitor UI and returned accepted states.
- The sector directory filter and sector/service presets were verified in the browser.
- Mobile navigation and homepage, service, contact, resource and article layouts were reviewed.
- All nine PDF pages were rendered and reviewed.
- Local test records remain separate from the hosted database.
- Temporary browser test routes were removed before packaging.

The owner inbox requires hosted ChatGPT identity; anonymous access was verified to fail in local preview. Hosted inbox access is checked separately after deployment when a signed-in owner session is available.
