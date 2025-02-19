import { v2 as cloudinary } from 'cloudinary'
import { EnvConfig } from '../config.js'

cloudinary.config({
  cloud_name: EnvConfig().cloudinary.cloud_name,
  api_key: EnvConfig().cloudinary.api_key,
  api_secret: EnvConfig().cloudinary.api_secret,
  secure: true
})

export const cloudinaryConfig = cloudinary
