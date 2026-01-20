import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const multerOptions = {
  storage: memoryStorage(), // ✅ memory storage for Cloudinary
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(
        new BadRequestException(
          'Only image files are allowed (jpg, jpeg, png, webp)',
        ),
        false,
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
};
