import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity';

export interface INotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: TypeOrmRepository<Notification>,
  ) {}

  async create(
    userId: string,
    data: {
      type?: string;
      title: string;
      message: string;
      link?: string;
    },
  ): Promise<INotification> {
    const notif = this.notifRepo.create({
      userId,
      type: data.type ?? NotificationType.SYSTEM,
      title: data.title,
      message: data.message,
      link: data.link ?? null,
      isRead: false,
    });
    await this.notifRepo.save(notif);
    return notif;
  }

  async listForUser(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<INotification[]> {
    const notifs = await this.notifRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 100),
      skip: offset,
    });
    return notifs;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<INotification> {
    const notif = await this.notifRepo.findOne({
      where: { id: notificationId, userId },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.isRead = true;
    await this.notifRepo.save(notif);
    return notif;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async remove(userId: string, notificationId: string): Promise<void> {
    await this.notifRepo.delete({ id: notificationId, userId });
  }

  async clearAll(userId: string): Promise<void> {
    await this.notifRepo.delete({ userId });
  }
}
