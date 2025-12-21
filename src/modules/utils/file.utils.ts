import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('FileUtils');

function getAbsoluteImagePath(imagePath: string): string {
  const filename = path.basename(imagePath);
  return path.join(process.cwd(), 'uploads', 'profile-images', filename);
}

export function deleteProfileImage(imagePath: string): void {
  if (!imagePath) {
    return;
  }
  const absolutePath = getAbsoluteImagePath(imagePath);
  if (fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
      logger.log(`Successfully deleted file: ${absolutePath}`);
    } catch (err) {
      logger.error(
        `Failed to delete file: ${absolutePath}`,
        (err as Error).stack,
      );
    }
  } else {
    logger.warn(`File not found for deletion: ${absolutePath}`);
  }
}
