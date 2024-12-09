export interface IFullFile {
  id: string
  fileUrl: string
  publicId: string
  image: string
  eventId: string
  imageUsage: string
}

export type IFilesUpload = Pick<IFullFile, 'image' | 'eventId'>
export type IFilesModel = Pick<IFullFile, 'fileUrl' | 'publicId' | 'eventId'>
export type IImageUsageModel = Pick<IFullFile, 'id' | 'imageUsage'>

export type IDownloadImage = Omit<IFullFile, 'image' | 'eventId'>;
export type IDownloadAudio = Omit<IFullFile, 'image' | 'eventId' | 'imageUsage'>;
export type IFilesId = Pick<IFullFile, 'publicId'>;