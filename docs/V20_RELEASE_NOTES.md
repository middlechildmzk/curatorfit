# CuratorFit V2 Release Notes

This package includes the V1.8 public launch polish, V1.9 SEO/tool expansion, and V2 SaaS Mode scaffold.

## V2 additions

- `NEXT_PUBLIC_CURATORFIT_MODE` mode switch.
- Public mode redirects `/admin` to `/waitlist` instead of exposing beta admin UI.
- `/v2` implementation overview page.
- `supabase/v2_migration.sql` with waitlist, pitch drafts, and campaign task helper tables.
- `docs/V2_SAAS_MODE.md` setup guide.

## Recommended deployment flow

1. Deploy public mode first.
2. Clean the repo artifact zip.
3. Add Vercel env var `NEXT_PUBLIC_CURATORFIT_MODE=public`.
4. When ready, create Supabase and switch to `saas` mode.
