# Local One Security Union

Local One Security Union is a Next.js 16 + TypeScript + Tailwind CSS application with:

- public union pages
- Supabase authentication and profile approval
- public site pages and contracts
- member-only resources
- admin management tools
- Resend-powered email notifications
- Google Maps site map

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase Auth, Database, and Storage
- Resend
- Google Maps JavaScript API via `@react-google-maps/api`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env.local`.

Required client-side variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Required server-side variables:

```bash
RESEND_API_KEY=
UNION_CONTACT_EMAIL=
```

3. Start the dev server:

```bash
npm run dev
```

4. Verify quality checks:

```bash
npm run lint
npm run build
```

## Environment Variable Review

This app is already structured so that only `NEXT_PUBLIC_*` values are available in the browser.

Client-safe variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

Server-only variables:

- `RESEND_API_KEY`
- `UNION_CONTACT_EMAIL`

Security notes:

- `RESEND_API_KEY` is used only in server routes and the shared email helper in [lib/resend.ts](/Users/jcgarcia/Documents/Codex/Local%20One/lib/resend.ts:1), which is marked `server-only`.
- The Supabase client in [lib/supabase.ts](/Users/jcgarcia/Documents/Codex/Local%20One/lib/supabase.ts:1) uses only the public anon key.
- No Supabase service role key is used anywhere in the current app.
- Do not add a service role key to client code or any `NEXT_PUBLIC_*` variable.

## Deploying To Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project into Vercel.
3. In Vercel Project Settings, add the environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
RESEND_API_KEY
UNION_CONTACT_EMAIL
```

4. Redeploy after adding variables.
5. Confirm the following routes work in preview and production:

- `/login`
- `/forgot-password`
- `/reset-password`
- `/sites-map`
- `/gallery`
- `/portal`
- `/admin`
- `/admin/audit-logs`

## Production Checklist

### Vercel Environment Variables

Set these in Vercel for Production, Preview, and Development as needed:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `RESEND_API_KEY`
- `UNION_CONTACT_EMAIL`

### Supabase Auth Redirect URLs

In Supabase Auth settings, add your production and preview URLs.

At minimum, allow:

- `https://your-domain.com/login`
- `https://your-domain.com/reset-password`
- `https://your-domain.com/forgot-password`

If Vercel preview deployments are used, also allow:

- `https://*.vercel.app/reset-password`

Recommended Site URL:

- your main production domain on Vercel

### Resend Verified Domain

Before production launch:

- verify your sending domain in Resend
- replace the default `onboarding@resend.dev` sender with your verified domain sender

Recommended:

- use a branded sender like `Local One Security Union <no-reply@yourdomain.com>`

### Google Maps API Key Restrictions

Restrict `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Google Cloud:

- allow only the Google Maps JavaScript API
- restrict HTTP referrers to your production domain
- allow preview domains only if you intentionally want preview maps enabled

Example referrer restrictions:

- `https://your-domain.com/*`
- `https://www.your-domain.com/*`
- optionally `https://*.vercel.app/*`

### Supabase Storage Bucket Policies

Review each bucket before launch:

- `contract-files`
  - public read if contract PDFs must stay public
  - writes limited to approved admins
- `gallery`
  - public read
  - writes limited to approved admins
- `leadership`
  - public read
  - writes limited to approved admins
- `member-resources`
  - private bucket
  - reads limited to approved members and approved admins
  - writes limited to approved admins

### Supabase Database Policies

Confirm Row Level Security and policies for:

- `profiles`
  - users can read/update only their own profile as appropriate
  - approved admins can review and manage member status and roles
- `sites`
  - public reads only for active, non-archived records if exposed through anon access
  - writes limited to approved admins
- `contracts`
  - public reads allowed
  - writes limited to approved admins
- `gallery_items`
  - public reads for active items
  - writes limited to approved admins
- `leadership`
  - public reads for active entries
  - writes limited to approved admins
- `member_resources`
  - active reads limited to approved members/admins
  - writes limited to approved admins
- `hiring_alert_signups`
  - public insert allowed
  - admin read access only
- `organizing_inquiries`
  - public insert allowed
  - admin read access only
- `audit_logs`
  - read access limited to approved admins
  - insert access limited to approved admins or secure server-side workflows

### Final Production Verification

Before launch, test:

1. Public site pages and contract links
2. Google Maps loads with production key restrictions
3. Sign up creates pending profiles
4. Login works for approved members and approved admins
5. Forgot password email arrives and reset flow completes
6. Organizing inquiry emails send through Resend
7. Hiring alert confirmations send through Resend
8. Admin uploads work for contracts, gallery, leadership, and member resources
9. Audit logs are created for admin actions
10. Member resources remain inaccessible to public users

## Notes

- This project currently depends on Supabase policies for true production authorization. The frontend already hides and guards admin/member features, but launch readiness depends on matching RLS and Storage policies.
- If you later add any server-side privileged admin actions, use a server-only service role key and never expose it via `NEXT_PUBLIC_*`.
