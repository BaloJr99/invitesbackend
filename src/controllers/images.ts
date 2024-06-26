import { ImagesService } from '../config/cloudinary/cloudinary.js';
import { validateImageUsage, validateImages } from '../schemas/images.js'
import { InviteImagesService } from '../services/inviteImages.js';
import { Request, Response } from 'express';
import { AuthModel } from '../interfaces/authModel.js';
import { handleHttp } from '../utils/error.handle.js';
import { verifyJwtToken } from '../utils/jwt.handle.js';

export class ImagesController {
  constructor (private imagesService: ImagesService, private inviteImagesService: InviteImagesService) {
    this.imagesService = imagesService;
    this.inviteImagesService = inviteImagesService;
  }

  createImage = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || '';

      if (token === "") return res.status(403).json({ error: 'No token provided' });

      const result = validateImages(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const decoded = verifyJwtToken(token) as AuthModel;

      const cloudResult = await this.imagesService.uploadImage(result.data.image);

      const { eventId } = result.data;

      await this.inviteImagesService.createImage(
        { imageUrl: cloudResult.secure_url, publicId: cloudResult.public_id, eventId },
        decoded.id
      );

      return res.status(201).json({ message: 'Imagenes agregadas' });
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_IMAGE');
    }
  }

  updateImage = async (req: Request, res: Response) => {
    try {
      const result = validateImageUsage(req.body);
  
      if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
      }
  
      await this.inviteImagesService.updateImages(result.data);
  
      return res.status(201).json({ message: 'Informacion actualizada' });
    } catch (error) {
      handleHttp(res, 'ERROR_UPDATE_IMAGE');
    }
  }

  deleteImage = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || '';
  
      if (token === "") return res.status(403).json({ error: 'No token provided' });
  
      const image = req.body;

      await this.imagesService.deleteImage(image.publicId);
  
      await this.inviteImagesService.deleteImage(image.id);
  
      return res.json({ message: 'Imagen eliminada' });
    } catch (error) {
      handleHttp(res, 'ERROR_DELETE_IMAGE');
    }
  }

  getAllImages = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization || '';
  
      if (token === "") return res.status(403).json({ error: 'No token provided' });
  
      const { id } = req.params;
  
      const [eventImages] = await this.inviteImagesService.getImageByEventId(id);
  
      return res.json(eventImages);
    } catch (error) {
      handleHttp(res, 'ERROR_CREATE_IMAGE');
    }
  }
}
