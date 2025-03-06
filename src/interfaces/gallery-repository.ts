import { IAlbum, IAlbumImage, IAlbumImageModel, IUpsertAlbum } from '../global/types.js'

export interface IGalleryRepository {
  getAlbumsByEventId(eventId: string): Promise<IAlbum[]>

  getAlbumImages(albumId: string): Promise<IAlbumImage[]>

  createAlbum(album: IUpsertAlbum): Promise<string>

  updateAlbum(albumId: string, album: IUpsertAlbum): Promise<void>

  deleteAlbum(albumId: string): Promise<void>

  checkAlbum(eventId: string, nameOfAlbum: string): Promise<boolean>

  createAlbumImage(image: IAlbumImageModel): Promise<void>
}
