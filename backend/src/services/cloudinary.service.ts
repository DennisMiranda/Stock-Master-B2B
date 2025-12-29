import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
    /**
     * Uploads an image to Cloudinary
     * @param filePath Path to the file or base64 string
     * @param folder Optional folder name in Cloudinary
     * @returns Promise with the upload result
     */
    async uploadImage(filePath: string, folder: string = 'products') {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: folder,
                resource_type: 'auto',
            });
            return {
                public_id: result.public_id,
                url: result.secure_url,
            };
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw new Error('Failed to upload image');
        }
    }

    /**
     * Deletes an image from Cloudinary
     * @param publicId The public ID of the image to delete
     */
    async deleteImage(publicId: string) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
            throw new Error('Failed to delete image');
        }
    }
}

export const cloudinaryService = new CloudinaryService();
