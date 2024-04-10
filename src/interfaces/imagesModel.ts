export interface ImageUpload {
  image: string,
  eventId: string
}

export interface ImagesModel {
  eventId: string,
  imageUrl: string, 
  publicId: string
}

export interface ImageUsageModel {
  id: string,
  imageUsage: string
}