import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  DeleteApiResponse,
} from 'cloudinary';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'profiles',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      console.log('file and folder ', file, folder);
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async destroyFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<DeleteApiResponse> {
    return cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  extractPublicId(url: string): string {
    // https://res.cloudinary.com/<cloud>/image/upload/v123/folder/file.jpg
    const match = url.match(/\/upload\/v\d+\/(.+)$/);
    return match ? match[1].replace(/\.[^/.]+$/, '') : '';
  }
}
