import type { ImageUpload } from "../../types";

export const uploadImage = async (image: ImageUpload): Promise<ImageUpload> => image;
export const deleteImage = (_image: string): boolean => false;
