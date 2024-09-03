import { Pool } from "mysql2/promise";
import { ImageUsageModel, ImagesModel } from "../interfaces/imagesModel.js";

export class InviteImagesService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getImageByEventId = async (eventId: string) => {
    return await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, imageUrl, publicId, imageUsage FROM inviteImages WHERE eventId = UUID_TO_BIN(?) ORDER BY imageUsage',
      [eventId]
    );
  }

  createImage = async (image: ImagesModel) => {
    const { imageUrl, publicId, eventId } = image;

    const [queryResult] = await this.connection.query('SELECT UUID() uuid');
    const [{ uuid }] = queryResult as { uuid: string }[];

    await this.connection.query(
      'INSERT INTO inviteImages (id, imageUrl, publicId, eventId) VALUES (UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?))',
      [uuid, imageUrl, publicId, eventId]
    );
  }

  updateImages = async (images: ImageUsageModel[]) => {
    for (const image of images) {
      const { id, imageUsage } = image
      await this.connection.query(
        'UPDATE inviteImages SET imageUsage = ? WHERE id = UUID_TO_BIN(?)',
        [imageUsage, id]
      )
    }
  };

  deleteImage = async (imageId: string) => {
    await this.connection.query(
      'DELETE FROM inviteImages WHERE id = UUID_TO_BIN(?)',
      [imageId]
    );
  }
}
