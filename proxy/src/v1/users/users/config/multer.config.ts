import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './cloudinary.config';
import { CLOUDINARY_FOLDER_NAME } from '../constants';

// Configure Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: CLOUDINARY_FOLDER_NAME, // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional transformations
  } as CloudinaryStorage['params'],
});

export const multerOptions: MulterOptions = {
  storage: cloudinaryStorage,
};
