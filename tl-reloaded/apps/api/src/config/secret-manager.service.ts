import { Injectable, Logger } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

@Injectable()
export class SecretManagerService {
    private readonly client: SecretManagerServiceClient;
    private readonly logger = new Logger(SecretManagerService.name);

    constructor() {
        this.client = new SecretManagerServiceClient();
    }

    async getSecret(secretName: string): Promise<string | null> {
        const projectId = process.env.GCP_PROJECT_ID;
        if (!projectId) {
            this.logger.warn(`GCP_PROJECT_ID not set, skipping secret lookup for ${secretName}`);
            return null;
        }

        try {
            const [version] = await this.client.accessSecretVersion({
                name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
            });

            const payload = version.payload?.data?.toString();
            if (!payload) {
                this.logger.warn(`Secret ${secretName} has no payload`);
                return null;
            }

            return payload;
        } catch (error) {
            this.logger.error(`Error accessing secret ${secretName}: ${error.message}`);
            return null;
        }
    }

    /**
     * Loads common secrets and injects them into process.env
     */
    async loadSecretsIntoEnv(): Promise<void> {
        if (process.env.NODE_ENV !== 'production' && !process.env.LOAD_SECRETS_LOCALLY) {
            this.logger.log('Skipping GCP Secret Manager in local development');
            return;
        }

        const secretsToLoad = [
            'DATABASE_URL',
            'DIRECT_URL',
            'JWT_SECRET',
            'GCP_STORAGE_BUCKET'
        ];

        for (const secret of secretsToLoad) {
            const value = await this.getSecret(secret);
            if (value) {
                process.env[secret] = value;
                this.logger.log(`Loaded secret ${secret} into environment`);
            }
        }
    }
}
