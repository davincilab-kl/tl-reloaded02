import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { join } from 'path';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly storage: Storage;
    private readonly bucketName: string;

    constructor() {
        this.storage = new Storage();
        this.bucketName = process.env.GCP_STORAGE_BUCKET || 'tl-reloaded-avatars';
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        // In local development, we might want to save to disk or use a mock
        if (process.env.NODE_ENV !== 'production' && !process.env.GCP_PROJECT_ID) {
            this.logger.log(`[Local] Simulated upload of ${file.originalname} to ${folder}`);
            // Return a placeholder or base64 data for local testing
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${file.originalname}`;
        }

        const bucket = this.storage.bucket(this.bucketName);
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;
        const blob = bucket.file(fileName);

        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (err) => {
                this.logger.error(`Upload error: ${err.message}`);
                reject(err);
            });

            blobStream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
                this.logger.log(`File uploaded successfully: ${publicUrl}`);
                resolve(publicUrl);
            });

            blobStream.end(file.buffer);
        });
    }
}
