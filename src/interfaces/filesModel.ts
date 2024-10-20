export interface IFullFiles {
  id: string
  fileUrl: string
  publicId: string
  image: string
  eventId: string
  imageUsage: string
}

export type IFilesUpload = Pick<IFullFiles, 'image' | 'eventId'>
export type IFilesModel = Pick<IFullFiles, 'fileUrl' | 'publicId' | 'eventId'>
export type IImageUsageModel = Pick<IFullFiles, 'id' | 'imageUsage'>
