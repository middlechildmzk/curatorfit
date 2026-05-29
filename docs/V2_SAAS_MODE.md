# CuratorFit V2 SaaS Mode

V2 is the bridge from public resource hub to real app.

## Mode switch

Set this environment variable when you are ready for protected SaaS behavior:

```env
NEXT_PUBLIC_CURATORFIT_MODE=saas
```

Default is public mode. In public mode, admin routes redirect to the waitlist so the live public site does not expose unfinished admin screens.

## Required environment variables

```env
NEXT_PUBLIC_CURATORFIT_MODE=saas
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=dllarson1991@gmail.com
```

## Setup order

1. Create Supabase project.
2. Run `supabase/schema.sql`.
3. Run `supabase/v2_migration.sql`.
4. Add env vars locally and in Vercel.
5. Create your user with magic-link login.
6. Set your profile role to `admin` or include your email in `ADMIN_EMAILS`.
7. Test `/admin`, `/campaigns`, `/saved`, `/profile`, and `/claim`.

## V2 product goals

- Persist saved targets.
- Persist campaigns and campaign target statuses.
- Save pitch drafts to campaigns.
- Convert release checklists into campaign tasks.
- Review imported targets and curator claims in admin.
- Keep public SEO/tools pages live even if app features are beta.

## Still deferred until V2.5+

- Stripe and paid review credits.
- Stripe Connect curator payouts.
- Spotify OAuth.
- Automated playlist ingestion.
- Bulk email outreach.
