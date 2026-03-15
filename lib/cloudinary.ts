import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export function getPublicId(url: string): string {
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return m ? m[1] : "";
}

export async function deleteImg(url: string): Promise<void> {
  const pid = getPublicId(url);
  if (pid) await cloudinary.uploader.destroy(pid);
}

/**
 * Signed upload params — NO upload_preset needed.
 * The signature + api_key is sufficient for authenticated uploads.
 * We sign: timestamp + folder only.
 */
export function getUploadParams(folder = "roja/products") {
  const timestamp = Math.round(Date.now() / 1000);

  // Only include what you actually send in FormData
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    folder,
    // No uploadPreset — signed uploads don't need it
  };
}