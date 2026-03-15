import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name:  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
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
 * Returns signed upload params for direct browser → Cloudinary upload.
 * IMPORTANT: Only sign { timestamp, folder } — NOT upload_preset.
 * upload_preset is appended to FormData separately by the client.
 */
export function getUploadParams(folder = "roja/products") {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName:    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey:       process.env.CLOUDINARY_API_KEY,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    folder,
  };
}