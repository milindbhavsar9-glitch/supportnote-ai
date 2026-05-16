# Phase 7 Security And Deployment Readiness

SupportNote AI currently runs in demo mode. Use fake data only until Supabase Auth and production tenant membership are fully connected.

## Implemented In Phase 7

- PDF export routes for shift and incident reports.
- Download PDF buttons in builders and saved records.
- Browser print buttons in report builders.
- Audit logs for report creation, edits, submit, complete, and admin review.
- Settings placeholders for data export and account deletion.
- Security status messaging for demo mode.

## RLS Review Notes

- RLS is enabled on the planned tenant tables in `supabase/schema.sql`.
- Solo/support worker access is scoped to `auth.uid()` for production.
- Team leader/company admin access is scoped through company membership helper functions.
- Current demo-mode server routes use the service role key and a browser demo session marker to keep testing possible before real login.
- Before real participant data is entered, replace demo login with Supabase Auth and remove any client-visible demo session fallback used for PDF links.

## Deployment Checklist

- `NEXT_PUBLIC_SUPABASE_URL` points to the Supabase project URL, not dashboard URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set.
- `SUPABASE_SERVICE_ROLE_KEY` is set only in Vercel server environment.
- `OPENAI_API_KEY` is added before testing AI generation.
- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set for Stripe checkout.
- `STRIPE_WEBHOOK_SECRET` is added after creating the Stripe webhook endpoint.
- Use HTTPS production URL: `https://supportnote-ai.vercel.app`.

## Production Before Real Client Data

- Replace demo admin login with Supabase Auth.
- Enforce user/company IDs on all report writes.
- Remove fake-data/demo account helpers.
- Review privacy policy and terms with an Australian legal professional.
- Confirm NDIS/client record retention requirements with the business owner.
