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

    let results

    try {
      results = await cloudinary.uploader.upload(image)
    } catch (error) {
      return false
    }
    return results
  }

  static async delete (id) {
    let results

    try {
      results = await cloudinary.uploader.destroy(id)
    } catch (error) {
      return false
    }

    return results
  }
}
