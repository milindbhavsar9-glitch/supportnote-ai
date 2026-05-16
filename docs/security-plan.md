# SupportNote AI Security And Privacy Plan

SupportNote AI may store sensitive support documentation, so security is product
functionality rather than a final polish task.

## Required Controls

- Supabase Auth for login and session management.
- Middleware protection for all app routes.
- Supabase Row Level Security on every sensitive table.
- Tenant isolation through `company_id` and `company_members`.
- Server-side derivation of `user_id` and `company_id`.
- Zod validation on every mutating API route.
- Stripe and OpenAI secret keys used only on the server.
- AI endpoints rate limited and plan limited.
- Audit logs for report creation, edits, submission, review, comments, and status changes.
- Privacy Policy, Terms of Service, export data, and delete account workflows.

## AI Handling

The app should send only necessary report fields to OpenAI. Avoid sending extra
participant identifiers where possible. AI-generated text must remain editable and
must show this disclaimer:

> AI-generated text must be reviewed before saving or submitting.

## Product Disclaimer

> SupportNote AI helps prepare documentation but does not replace your
> organisation's policies, supervisor review, clinical judgement, or NDIS
> reporting obligations. Users are responsible for reviewing all AI-generated text
> before saving or submitting.
