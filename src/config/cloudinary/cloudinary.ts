import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

export class ImagesService {
  uploadImage = async (image: string) => {
    return await cloudinary.uploader.upload(image);
  }

  deleteImage = async (imageId: string) => {
    return await cloudinary.uploader.destroy(imageId);
  }
}