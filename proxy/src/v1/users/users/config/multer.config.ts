import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './cloudinary.config';
import { CLOUDINARY_FOLDER_NAME } from '../constants';
import { Request } from 'express';

// Configure Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    public_id: (req: Request, file: Express.Multer.File) => {
      return `${req['user'].fullName}_${req['user'].email}_${Date.now()}_${file.originalname.split('.')[0]}`;
    },
    folder: CLOUDINARY_FOLDER_NAME, // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional transformations
  } as CloudinaryStorage['params'],
});

export const multerOptions: MulterOptions = {
  storage: cloudinaryStorage,
};
