import { cloudinaryConfig } from "../config/cloudinary/cloudinary.js"

export class ImagesService {
  constructor(private cloudinary: typeof cloudinaryConfig) {
    this.cloudinary = cloudinary
  }

  uploadImage = async (image: string, folder: string) => {
    return await this.cloudinary.uploader.upload(image, {
      folder
    })
  }

  deleteImage = async (imageId: string) => {
    return await this.cloudinary.uploader.destroy(imageId)
  }
}
