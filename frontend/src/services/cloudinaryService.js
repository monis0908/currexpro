const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getConfiguration() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Add the Cloudinary cloud name and unsigned upload preset to your .env file.");
  }

  return { cloudName, uploadPreset };
}

export function validateCustomerImage(file) {
  if (!file) return "Please choose an image.";
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, or WebP image.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Image size must be 5 MB or less.";
  }
  return null;
}

export async function uploadCustomerImage(file) {
  const validationError = validateCustomerImage(file);
  if (validationError) throw new Error(validationError);

  const { cloudName, uploadPreset } = getConfiguration();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "currexpro/customers");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Image upload failed.");
  }

  return { imageUrl: result.secure_url, imagePublicId: result.public_id };
}
