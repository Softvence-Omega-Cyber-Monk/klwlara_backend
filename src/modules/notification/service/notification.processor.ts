// import { Processor, WorkerHost } from '@nestjs/bullmq';
// import { Job } from 'bullmq';

// interface NotificationJobData {
//   userId: string;
//   message: string;
// }

// @Processor('notification')
// export class NotificationProcessor extends WorkerHost {
//   async process(job: Job<NotificationJobData>): Promise<void> {
//     const { userId, message } = job.data;
//     // Send your notification (email, SMS, push)
//     console.log(`Sending to ${userId}: ${message}`);
//   }
// }

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma';
import { Gateway } from './notification.getway';
import { NotificationType } from '../dto/create-notification.dto';

interface NotificationJobData {
  userId: string;
  message: string;
  projectId: string;
}

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: Gateway,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { userId, message, projectId } = job.data;

    const clientUser = await this.prisma.client.user.findFirst({
      where: { role: Role.CLIENT },
    });

    if (!clientUser) {
      console.error('No client user found in the system.');
      return;
    }

    // Create a notification record for this client (optional, if you store them)
    const notification = await this.prisma.client.notification.create({
      data: {
        senderId: clientUser.id,
        receiverIds: [userId],
        projectId,
        context: message,
        type: NotificationType.REMINDER,
        provisions: {
          create: {
            user: { connect: { id: userId } },
          },
        },
      },
      include: { provisions: true },
    });

    // Emit real-time event to the receiver (employee or project owner)
    await this.notificationGateway.emitToUsers(
      [userId],
      'REMINDER',
      notification,
    );

    console.log(`✅ Notification sent to user ${userId}: ${message}`);
  }
}
