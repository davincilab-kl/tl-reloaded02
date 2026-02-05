import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebinarsService {
    private readonly logger = new Logger(WebinarsService.name);
    private readonly apiBaseUrl = 'https://api.calendly.com';

    constructor(
        private prisma: PrismaService,
        private readonly httpService: HttpService,
    ) { }

    async syncCalendlyEvents() {
        const apiToken = process.env.CALENDLY_API_TOKEN;
        const userUri = process.env.CALENDLY_USER_URI;

        if (!apiToken || !userUri) {
            this.logger.error('Calendly API Token or User URI not configured');
            throw new Error('Calendly configuration missing');
        }

        try {
            // 1. Fetch Scheduled Events
            const response = await firstValueFrom<{ data: { collection: any[] } }>(
                this.httpService.get(`${this.apiBaseUrl}/scheduled_events`, {
                    params: { user: userUri, status: 'active', sort: 'start_time:asc' },
                    headers: { Authorization: `Bearer ${apiToken}` },
                }),
            );

            const events = response.data.collection;
            let syncedCount = 0;

            for (const event of events) {
                const eventUri = event.uri;
                const calendlyId = eventUri.split('/').pop();

                // Upsert Event
                const dbEvent = await this.prisma.client.calendlyEvent.upsert({
                    where: { calendlyId },
                    update: {
                        eventName: event.name,
                        startTime: new Date(event.start_time),
                        status: event.status,
                        location: typeof event.location === 'string' ? event.location : event.location?.join_url,
                    },
                    create: {
                        calendlyId,
                        eventName: event.name,
                        startTime: new Date(event.start_time),
                        status: event.status,
                        location: typeof event.location === 'string' ? event.location : event.location?.join_url,
                    },
                });

                // 2. Fetch Invitees for this event
                const inviteesResponse = await firstValueFrom<{ data: { collection: any[] } }>(
                    this.httpService.get(`${eventUri}/invitees`, {
                        headers: { Authorization: `Bearer ${apiToken}` },
                    }),
                );

                const invitees = inviteesResponse.data.collection;
                for (const invitee of invitees) {
                    await this.prisma.client.calendlyEventAttendee.upsert({
                        where: {
                            eventId_email: {
                                eventId: dbEvent.id,
                                email: invitee.email,
                            },
                        },
                        update: { name: invitee.name },
                        create: {
                            eventId: dbEvent.id,
                            name: invitee.name,
                            email: invitee.email,
                        },
                    });
                }
                syncedCount++;
            }

            return { success: true, synced: syncedCount };
        } catch (error) {
            this.logger.error(`Failed to sync Calendly: ${error.message}`);
            throw error;
        }
    }

    async getWebinars() {
        return this.prisma.client.calendlyEvent.findMany({
            include: { attendees: true },
            orderBy: { startTime: 'desc' },
        });
    }
}
