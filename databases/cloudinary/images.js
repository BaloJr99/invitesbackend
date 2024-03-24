import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
})

export class ImagesModel {
  static async add ({ input }) {
    const { image } = input

    const results = await cloudinary.uploader.upload(image)

    return results
  }

  static async delete (id) {
    const results = await cloudinary.uploader.destroy(id)

    return results
  }
}
