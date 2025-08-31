# Webhook Debug Checklist

## Environment Variables Required

Make sure you have these environment variables set in your `.env.local` file:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Base URL (for development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# For production, this should be your actual domain
```

## Common Issues & Solutions

### 1. Webhook Verification Failing

- Check if `CLERK_WEBHOOK_SECRET` is correct
- Verify the webhook endpoint URL in Clerk dashboard matches your route
- Ensure the webhook is configured for `user.updated` events

### 2. Base URL Issues

- In development: use `http://localhost:3000`
- In production: use your actual domain or `NEXT_PUBLIC_VERCEL_URL`

### 3. Supabase Storage Issues

- Verify the `profile-pic` bucket exists in Supabase
- Check if the bucket has proper permissions
- Ensure `SUPABASE_SERVICE_ROLE_KEY` has write access

### 4. Database Issues

- Verify the `profiles` table exists
- Check if the `user_id` and `pfp_url` columns exist
- Ensure the user has a profile record in the database

## Testing Steps

1. **Test webhook endpoint locally:**

   ```bash
   node test-webhook.js
   ```

2. **Check browser console** for webhook logs when updating a profile picture

3. **Check server logs** for detailed error messages

4. **Verify Clerk webhook configuration:**
   - Go to Clerk Dashboard > Webhooks
   - Ensure endpoint URL is correct
   - Check if webhook is active and receiving events

## Debug Commands

```bash
# Check if your app is running
curl http://localhost:3000/api/webhooks/clerk

# Test the sync endpoint directly
curl -X POST http://localhost:3000/api/sync-profile-pic \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","profileImageUrl":"https://example.com/test.jpg"}'
```

## Next Steps

1. Set up proper environment variables
2. Test the endpoints locally
3. Check Clerk webhook configuration
4. Monitor logs for errors
5. Update profile picture in Clerk to trigger webhook
