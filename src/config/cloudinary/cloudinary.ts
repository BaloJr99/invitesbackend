import { v2 as cloudinary } from 'cloudinary'
import 'dotenv/config'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
})

export class ImagesService {
  uploadImage = async (image: string, folder: string) => {
    return await cloudinary.uploader.upload(image, {
      folder
    })
  }

  deleteImage = async (imageId: string) => {
    return await cloudinary.uploader.destroy(imageId)
  }
}
