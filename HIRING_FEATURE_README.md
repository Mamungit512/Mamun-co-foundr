# Hiring Feature Implementation

This document outlines the implementation of the "We're Hiring" feature with Clerk billing integration.

## Overview

The hiring feature allows founders to:

1. Toggle "I'm Hiring" status in their profile settings
2. Display a green "Hiring" badge next to their name in search results
3. Receive direct email inquiries from potential candidates
4. Allow candidates to attach resumes when sending inquiries

## Features Implemented

### 1. Database Schema Updates

- Added `is_hiring` (boolean) and `hiring_email` (string) fields to the profiles table
- Updated TypeScript types in `types/global.d.ts`
- Updated mapping functions in `src/lib/mapProfileToFromDBFormat.ts`

### 2. Clerk Billing Integration

- Uses Clerk's `has()` function to check for `hiring_badge` feature access
- Implements paywall for users without Collab Tier subscription
- Redirects to billing upgrade page for non-subscribers

### 3. UI Components

#### HiringSettings Component (`src/components/HiringSettings.tsx`)

- Toggle switch for "I'm Hiring" status
- Email input field (required when hiring is enabled)
- Clerk billing check with upgrade prompt
- Form validation and error handling

#### HiringBadge Component (`src/components/HiringBadge.tsx`)

- Green dot with "Hiring" text
- Clickable badge that opens email modal
- Displays company name in email subject

#### EnhancedEmailComponent (`src/components/EnhancedEmailComponent.tsx`)

- File upload functionality for resumes
- Email composition with pre-filled subject
- File validation (PDF, DOC, DOCX, TXT, JPG, PNG, max 10MB)

### 4. API Endpoints

#### File Upload API (`src/app/api/upload-resume/route.ts`)

- Handles file uploads to Supabase Storage
- File type and size validation
- Returns public URL for uploaded files

### 5. Profile Integration

- Added hiring settings section to edit profile page
- Displays hiring badge in matching interface
- Shows hiring badge in liked profiles modal

### 6. Billing Page (`src/app/billing/upgrade/page.tsx`)

- Upgrade page for Collab Tier subscription
- Feature list and pricing information
- Call-to-action for subscription upgrade

## Usage Flow

### For Founders:

1. Go to Edit Profile page
2. Scroll to "Hiring Settings" section
3. Toggle "I'm Hiring" switch
4. Enter hiring email address
5. Save settings
6. Hiring badge appears on profile in search results

### For Candidates:

1. See "Hiring" badge next to founder's name
2. Click badge to open email modal
3. Optionally upload resume
4. Click "Send Email Inquiry" to open default email client
5. Email is pre-filled with subject and optional resume link

## Environment Variables Required

Add these to your `.env` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk Authentication
CLERK_SECRET_KEY=

# Email Service (Resend)
RESEND_API_KEY=

# Application URLs
NEXT_PUBLIC_BASE_URL=
NEXT_PUBLIC_PRODUCTION_URL=

# Access Control
NEXT_PUBLIC_MAMUN_ACCESS_CODE=

# Environment
NODE_ENV=
```

## Database Migration

You'll need to add these columns to your `profiles` table:

```sql
ALTER TABLE profiles
ADD COLUMN is_hiring BOOLEAN DEFAULT FALSE,
ADD COLUMN hiring_email TEXT;
```

## Supabase Storage Setup

Create a storage bucket called `resume-uploads` for file uploads:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resume-uploads', 'resume-uploads', true);

-- Set up RLS policies
CREATE POLICY "Users can upload their own resumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resume-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resume-uploads');
```

## Clerk Billing Setup

1. Enable billing in your Clerk Dashboard
2. Create a subscription plan called "Collab Tier"
3. Add a feature called `hiring_badge` to the plan
4. Configure pricing and billing settings

## Testing

To test the feature:

1. Create a test user account
2. Complete onboarding
3. Go to edit profile and try to enable hiring settings
4. Verify paywall appears for non-subscribers
5. Test the upgrade flow
6. Test email functionality with file upload

## Future Enhancements

- Email templates customization
- Analytics for hiring badge clicks
- Integration with job posting platforms
- Advanced candidate filtering
- Interview scheduling integration
