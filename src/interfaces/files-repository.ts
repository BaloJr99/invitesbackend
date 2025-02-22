import { FileType } from '../global/enum.js'
import {
  IDownloadAudio,
  IDownloadImage,
  IFilesId,
  IFilesModel,
  IImageUsageModel
} from '../global/types.js'

export interface IFilesRepository {
  getImageByEventId(eventId: string): Promise<IDownloadImage[]>

  getAudioByEventId(eventId: string): Promise<IDownloadAudio[]>

  createFile(image: IFilesModel, fileType: FileType): Promise<void>

  updateImages(images: IImageUsageModel[]): Promise<void>

  deleteFile(imageId: string, fileType: FileType): Promise<void>

  uploadAsset(
    file: string | Buffer,
    folder: string,
    fileType: FileType
  ): Promise<unknown>

  deleteAsset(imageId: string, fileType: FileType): Promise<void>

  getAllImages(): Promise<IFilesId[]>

  getAllAudios(): Promise<IFilesId[]>
}
