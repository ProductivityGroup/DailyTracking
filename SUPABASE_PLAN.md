# Phase 8: Supabase Migration (Replacing Clerk)

## 1. Remove Clerk Dependencies & Code
- [ ] Frontend: Uninstall `@clerk/clerk-react` and remove `<ClerkProvider>` from `main.tsx`.
- [ ] Frontend: Remove `<SignedIn>`, `<SignedOut>`, `<SignInButton>`, and `<UserButton>` from `App.tsx` and `AppLayout.tsx`.
- [ ] Frontend: Delete `useApi.ts` since Supabase handles JWTs differently.
- [ ] Backend: Uninstall `@clerk/clerk-sdk-node` and `svix`.
- [ ] Backend: Remove `ClerkExpressRequireAuth` from `index.ts`.
- [ ] Backend: Delete the webhook endpoint (`server/src/routes/webhooks.ts`).

## 2. Supabase Integration
- [ ] Create a new Supabase Project.
- [ ] Frontend: Install `@supabase/supabase-js`.
- [ ] Frontend: Create a `supabaseClient.ts` to initialize the connection.
- [ ] Frontend: Build a custom Login/Register page (since Supabase doesn't have a drop-in `<SignInButton>` component natively embedded in the same way).
- [ ] Frontend: Create an `AuthProvider` context to manage the session state globally.
- [ ] Backend: Refactor the API routes (`habits.ts`, `analytics.ts`, etc.) to securely verify the Supabase JWT sent in the `Authorization` header using `supabase.auth.getUser(jwt)`.

## 3. Database Migration
- [ ] Since Supabase *is* a PostgreSQL database, we will migrate the Prisma schema directly to the Supabase instance.
- [ ] Set up Supabase Database Webhooks (or Postgres Triggers) to automatically insert a row into our public `User` table upon auth registration.
