// Headless version of FaceDetectionUploader's checks, for the compact photo
// row in the quick onboarding. Thresholds and HEIC handling match the
// uploader so both flows accept the same photos.

export const FACE_MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
const MODEL_LOAD_TIMEOUT_MS = 15000;
const MIN_CONFIDENCE = 0.6;
// Extra strict check against good cartoons
const MIN_BEST_SCORE = 0.75;

let modelPromise: Promise<typeof import("@vladmandic/face-api")> | null = null;

// Starts loading the detection model; safe to call repeatedly. A failed load
// is forgotten so the next call retries.
export function loadFaceModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const faceapi = await import("@vladmandic/face-api");
      await Promise.race([
        faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_MODEL_URL),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Model load timed out")), MODEL_LOAD_TIMEOUT_MS),
        ),
      ]);
      return faceapi;
    })();
    modelPromise.catch(() => {
      modelPromise = null;
    });
  }
  return modelPromise;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to process image file."));
    };
    img.src = url;
  });
}

// Converts HEIC to JPEG if needed and confirms the photo shows a real face.
// Resolves with the file to upload; rejects with a user-facing message.
export async function prepareFacePhoto(file: File): Promise<File> {
  const { isHeic, heicTo } = await import("heic-to");
  // File.type for HEIC/HEIF is unreliable across browsers/OSes (often
  // empty), so ask heic-to to sniff the actual file bytes instead.
  const fileIsHeic = await isHeic(file).catch(() => false);

  if (!fileIsHeic && !file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  let workingFile = file;
  if (fileIsHeic) {
    try {
      const converted = await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
      workingFile = new File([converted], file.name.replace(/\.hei[cf]$/i, "") + ".jpg", {
        type: "image/jpeg",
      });
    } catch {
      throw new Error("Couldn't process this photo. Please try a different photo.");
    }
  }

  let faceapi: Awaited<ReturnType<typeof loadFaceModel>>;
  try {
    faceapi = await loadFaceModel();
  } catch {
    throw new Error("The photo checker didn't load. Check your connection and try again.");
  }

  const img = await loadImage(workingFile);
  const detections = await faceapi.detectAllFaces(
    img,
    new faceapi.SsdMobilenetv1Options({ minConfidence: MIN_CONFIDENCE }),
  );

  if (detections.length === 0) {
    throw new Error("No face detected. Please use a real photo of yourself.");
  }
  if (detections[0].score <= MIN_BEST_SCORE) {
    throw new Error("We couldn't clearly see a face. Please try a clearer photo.");
  }
  return workingFile;
}

export async function uploadProfilePhoto(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-profile-pic", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Upload failed. Please try again.");
  }

  const result = await response.json();
  return result.url as string;
}
