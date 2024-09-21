export interface IFullImage {
  id: string
  imageUrl: string
  publicId: string
  image: string
  eventId: string
  imageUsage: string
}

export type ImageUpload = Pick<IFullImage, 'image' | 'eventId'>
export type ImagesModel = Pick<IFullImage, 'imageUrl' | 'publicId' | 'eventId'>
export type ImageUsageModel = Pick<IFullImage, 'id' | 'imageUsage'>
