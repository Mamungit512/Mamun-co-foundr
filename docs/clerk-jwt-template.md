# Clerk JWT Template Setup

To forward `organization_id` from Clerk `publicMetadata` into every session JWT
(so that middleware and Supabase RLS can read it), update the **Clerk JWT Template**
in the Clerk dashboard.

## Steps

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → your app → **JWT Templates**
2. Select the template your app uses (or the default Supabase-compatible template)
3. Merge in the following claims:

```json
{
  "metadata": {
    "onboardingComplete": "{{user.public_metadata.onboardingComplete}}",
    "organization_id": "{{user.public_metadata.organization_id}}"
  }
}
```

> The `organization_id` value is the **Supabase UUID** of the school's row in the
> `organizations` table. It is set server-side by the `user.created` webhook when
> a student signs up via a school invite link. It is `null` / absent for general
> CoFoundr users.

## How it flows

```
publicMetadata.organization_id (set by webhook)
  → JWT claim: metadata.organization_id
  → sessionClaims.metadata.organization_id  (read by middleware + API routes)
  → auth.jwt() -> 'metadata' ->> 'organization_id'  (read by Supabase RLS)
```

## Verify

After updating the template, sign in as a school test user and call:

```ts
const { sessionClaims } = await auth();
console.log(sessionClaims?.metadata?.organization_id); // should be the org UUID
```
