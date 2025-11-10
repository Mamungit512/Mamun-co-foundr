# Face Detection Implementation

This document explains the AI-powered face detection implementation for profile picture uploads.

## Overview

We use `@vladmandic/face-api` with the **SSD MobileNet V1** model to validate that profile pictures contain real human faces. This helps prevent:

- Fake profiles with cartoon avatars
- Non-human images (logos, objects, etc.)
- Low-quality or AI-generated images (to some extent)
- Inappropriate content

## Where Face Detection is Active

### ✅ Fully Protected Upload Points

1. **Onboarding Flow** (`/onboarding`)
   - Step 1: Profile Photo Upload
   - File: `src/app/onboarding/form-components/ProfilePhotoForm.tsx`
   - Users MUST upload a validated photo during onboarding

2. **Edit Profile Page** (`/edit-profile`)
   - Profile Picture section at the top
   - File: `src/app/edit-profile/page.tsx`
   - Users can update their photo with face validation

### ⚠️ Partially Protected Upload Points

3. **Clerk's Built-in Components** (e.g., `<UserProfile />`, `<UserButton />`)
   - **Limitation**: Clerk handles uploads directly on their servers
   - **Current Status**: NO face detection validation
   - **Sync Process**: Photos from Clerk are synced to Supabase via webhook
   - **Files Involved**:
     - `src/app/api/webhooks/clerk/route.ts` - Receives webhook
     - `src/app/api/sync-profile-pic/route.ts` - Downloads and syncs to Supabase

## Technical Implementation

### Components

#### FaceDetectionUploader

**Location**: `src/components/FaceDetectionUploader.tsx`

**How it works**:

```typescript
1. Loads SSD MobileNet V1 model (~5MB) from CDN on component mount
2. User selects an image file
3. Creates an HTML image element from the file
4. Runs face detection with minConfidence: 0.6
5. Applies stricter validation with score > 0.75
6. Calls onValidationSuccess(file) or onValidationFail(error)
```

**Usage Example**:

```tsx
import dynamic from "next/dynamic";

const FaceDetectionUploader = dynamic(
  () => import("@/components/FaceDetectionUploader"),
  { ssr: false }, // REQUIRED: face-api.js is browser-only
);

<FaceDetectionUploader
  onValidationSuccess={(file) => {
    // File contains a valid human face
    handleUpload(file);
  }}
  onValidationFail={(error) => {
    // Show error to user
    setError(error);
  }}
/>;
```

### API Endpoints

#### POST `/api/upload-profile-pic`

**Purpose**: Upload validated profile pictures to Supabase

**Authentication**: Requires Clerk authentication token

**Process**:

1. Validates user authentication
2. Checks file type (jpeg, png, webp)
3. Validates file size (max 5MB)
4. Removes old profile pictures
5. Uploads to Supabase Storage bucket `profile-pic`
6. Updates `profiles` table with new `pfp_url`

**Important**: This endpoint assumes the file has already been validated by the `FaceDetectionUploader` component on the client side.

## Configuration

### Confidence Thresholds

Located in `FaceDetectionUploader.tsx` line 78 and 86:

```typescript
// Initial detection threshold
minConfidence: 0.6;

// Strict validation threshold
if (bestScore > 0.75) {
  // Adjustable
  // Valid face
}
```

**Adjustment Guide**:

- **Lower threshold (0.6 - 0.7)**: More lenient, accepts more photos but might allow some edge cases
- **Higher threshold (0.8 - 0.9)**: More strict, rejects more photos but ensures highest quality
- **Current setting (0.75)**: Balanced approach

### Model Selection

Current: **SSD MobileNet V1**

- Size: ~5MB
- Accuracy: High
- Speed: Fast enough for real-time validation

Alternative (commented out in code):

```typescript
// For even stricter checks, add facial landmarks:
await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
// Then detect with landmarks to verify eyes, nose, mouth positions
```

## Clerk Component Limitation & Solutions

### The Problem

Clerk's built-in `<UserProfile />` and `<UserButton />` components allow users to upload profile pictures directly to Clerk's servers. We cannot intercept these uploads with client-side face detection.

### Why We Can't Validate (Currently)

1. **Browser-only library**: `@vladmandic/face-api` requires browser APIs (Canvas, WebGL) that don't exist in Node.js
2. **Webhook timing**: By the time our webhook receives the event, Clerk has already accepted the image
3. **No rejection mechanism**: We can't "reject" an image that Clerk has already stored

### Solution Options

#### Option 1: Use Server-Side Face Detection (Recommended for Production)

Replace the browser-only library in the sync endpoint with a server-compatible service:

**AWS Rekognition** (Example):

```typescript
// In src/app/api/sync-profile-pic/route.ts
import {
  RekognitionClient,
  DetectFacesCommand,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const command = new DetectFacesCommand({
  Image: { Bytes: imageBuffer },
  Attributes: ["DEFAULT"],
});

const response = await rekognition.send(command);
const hasFace = response.FaceDetails && response.FaceDetails.length > 0;
```

**Alternatives**:

- Google Cloud Vision API
- Azure Face API
- Self-hosted TensorFlow/PyTorch model via HTTP API

**Cost**: ~$1 per 1,000 images (very affordable)

#### Option 2: Disable Clerk's Image Upload

Hide the profile picture upload in Clerk components and force users to use your validated uploader:

```tsx
import { UserProfile } from "@clerk/nextjs";

<UserProfile
  appearance={{
    elements: {
      profileSectionPrimaryButton__profileImage: { display: "none" },
      profileSection__profileImage: { display: "none" },
    },
  }}
/>;
```

Then only allow uploads via the Edit Profile page which has face detection.

#### Option 3: Flag for Manual Review

In `sync-profile-pic` route, accept all Clerk uploads but flag questionable ones:

```typescript
// Add a review flag to database
await supabase
  .from("profiles")
  .update({
    pfp_url: publicUrl,
    needs_photo_review: true, // Admin can manually review later
  })
  .eq("user_id", userId);
```

## Current Recommendation

For now, we've implemented face detection in the two main upload points (onboarding and edit profile).

**For production**, I recommend:

1. Implement **Option 1** (AWS Rekognition) in the `sync-profile-pic` endpoint
2. This ensures ALL profile pictures are validated, regardless of upload method
3. Cost is minimal (~$1 per 1,000 images)
4. Setup takes about 30 minutes

## Testing

### Valid Test Cases

- Clear selfie photos
- Professional headshots
- Photos with good lighting
- Various ethnicities and ages

### Invalid Test Cases (Should be rejected)

- Cartoon avatars
- Logos or brand images
- Landscape photos without faces
- Group photos (may pass depending on clarity)
- Very blurry or dark photos
- AI-generated low-quality images

### Test Page

Visit `/test-face-detection` to test the face detection component in isolation.

## Files Modified/Created

### New Files

- `src/app/onboarding/form-components/ProfilePhotoForm.tsx`
- `src/app/api/upload-profile-pic/route.ts`
- `FACE_DETECTION_IMPLEMENTATION.md` (this file)

### Modified Files

- `src/components/forms/CreateProfile.tsx` - Added ProfilePhotoForm as step 1
- `src/app/edit-profile/page.tsx` - Added profile picture upload section

### Existing Files (Already had face detection)

- `src/components/FaceDetectionUploader.tsx` - Core component
- `src/app/test-face-detection/page.tsx` - Test/demo page

## Dependencies

```json
{
  "@vladmandic/face-api": "^1.7.15" // Already in package.json
}
```

No additional dependencies needed for current implementation.

For AWS Rekognition (future):

```bash
npm install @aws-sdk/client-rekognition
```

## Troubleshooting

### Issue: "AI model is still loading"

**Solution**: The 5MB model needs a few seconds to load. Users should wait for the "AI ready" message.

### Issue: Valid photos being rejected

**Solution**: Lower the confidence threshold in `FaceDetectionUploader.tsx` line 86 from 0.75 to 0.70 or 0.65

### Issue: Cartoon avatars passing validation

**Solution**: Increase the confidence threshold in `FaceDetectionUploader.tsx` line 86 from 0.75 to 0.85 or 0.90

### Issue: Component not rendering

**Solution**: Ensure you're using `dynamic` import with `ssr: false`:

```tsx
const FaceDetectionUploader = dynamic(
  () => import("@/components/FaceDetectionUploader"),
  { ssr: false },
);
```

## Future Enhancements

1. **Add facial landmark detection** for stricter validation
2. **Age estimation** to filter inappropriate content
3. **Face quality checks** (brightness, sharpness, blur detection)
4. **Multiple face detection** to prefer/require solo photos
5. **Server-side validation** for Clerk uploads (AWS Rekognition)
6. **Progressive image loading** while AI model loads
7. **Offline fallback** for when CDN is slow

## Support

For issues or questions about face detection:

1. Check the test page: `/test-face-detection`
2. Review browser console for detailed logs
3. Verify the AI model loaded successfully
4. Test with different photos to isolate the issue
