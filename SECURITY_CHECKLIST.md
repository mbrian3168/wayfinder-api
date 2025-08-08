# Wayfinder API — Public Exposure Checklist

Use this before merging any new/changed endpoint.

## Classify
- [ ] **@visibility:** public | partner | internal
- [ ] Tenant scoping enforced (partner sees only their data)?

## AuthN / AuthZ
- [ ] Public endpoints **do not** mutate data or reveal PII.
- [ ] Protected endpoints require Firebase (user) or Partner key/OAuth.
- [ ] RBAC checks exist in controller/service.

## Data Hygiene
- [ ] No secrets, tokens, keys, emails, phone numbers in responses/logs.
- [ ] Error responses are generic; details go to server logs only.
- [ ] Pagination/rate limits applied if listable.

## Network/Platform
- [ ] CORS restricted in prod (only trusted origins).
- [ ] Rate limiting present (or ticket created to add).
- [ ] No stack traces in prod responses.

## Docs
- [ ] **Public docs** only include endpoints marked `@visibility public`.
- [ ] **Partner docs** (when added) will be gated.
