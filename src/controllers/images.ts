import { ImagesService } from '../config/cloudinary/cloudinary.js';
import { validateImageUsage, validateImages } from '../schemas/images.js'
import { InviteImagesService } from '../services/inviteImages.js';
import { Request, Response } from 'express';
import { ErrorHandler } from '../utils/error.handle.js';
import { LoggerService } from '../services/logger.js';

export class ImagesController {
  errorHandler: ErrorHandler;
  constructor (
    private imagesService: ImagesService, 
    private inviteImagesService: InviteImagesService,
    private loggerService: LoggerService
  ) {
    this.imagesService = imagesService;
    this.inviteImagesService = inviteImagesService;
    this.errorHandler = new ErrorHandler(this.loggerService);
  }

  createImage = async (req: Request, res: Response) => {
    try {
      const result = validateImages(req.body);

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) });
      }

      const cloudResult = await this.imagesService.uploadImage(result.data.image);

      const { eventId } = result.data;

      await this.inviteImagesService.createImage({ imageUrl: cloudResult.secure_url, publicId: cloudResult.public_id, eventId });

      return res.status(201).json({ message: 'Imagenes agregadas' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_CREATE_IMAGE', e.message, req.userId);
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
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_UPDATE_IMAGE', e.message, req.userId);
    }
  }

  deleteImage = async (req: Request, res: Response) => {
    try {
      const image = req.body;

      await this.imagesService.deleteImage(image.publicId);
  
      await this.inviteImagesService.deleteImage(image.id);
  
      return res.json({ message: 'Imagen eliminada' });
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_DELETE_IMAGE', e.message, req.userId);
    }
  }

  getAllImages = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      const [eventImages] = await this.inviteImagesService.getImageByEventId(id);
  
      return res.json(eventImages);
    } catch (_e) {
      const e:Error = _e as Error;
      this.errorHandler.handleHttp(res, 'ERROR_GET_ALL_IMAGES', e.message, req.userId);
    }
  }
}
