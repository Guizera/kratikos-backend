import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

export interface CreateNotificationDto {
  recipientId: string;
  senderId: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  content?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Cria uma nova notificação
   * Evita duplicatas: se já existe notificação não lida do mesmo tipo/sender/post, não cria
   */
  async create(dto: CreateNotificationDto): Promise<Notification | null> {
    // Não notificar a si mesmo
    if (dto.recipientId === dto.senderId) {
      return null;
    }

    // Verificar se já existe notificação similar não lida
    const existing = await this.notificationRepository.findOne({
      where: {
        recipientId: dto.recipientId,
        senderId: dto.senderId,
        type: dto.type,
        postId: dto.postId || null,
        commentId: dto.commentId || null,
        isRead: false,
      },
    });

    if (existing) {
      this.logger.debug(
        `⚠️ Notificação duplicada ignorada: ${dto.type} de ${dto.senderId} para ${dto.recipientId}`,
      );
      return existing;
    }

    // Criar notificação
    const notification = this.notificationRepository.create({
      recipientId: dto.recipientId,
      senderId: dto.senderId,
      type: dto.type,
      postId: dto.postId || null,
      commentId: dto.commentId || null,
      content: dto.content || null,
      metadata: dto.metadata || null,
    });

    const saved = await this.notificationRepository.save(notification);
    this.logger.log(
      `✅ Notificação criada: ${dto.type} de ${dto.senderId} para ${dto.recipientId}`,
    );

    return saved;
  }

  /**
   * Lista notificações do usuário (paginado)
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { recipientId: userId },
      relations: ['sender', 'post', 'comment'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });

    return {
      data,
      total,
      unreadCount,
      page,
      limit,
    };
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientId: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    this.logger.log(`✅ Todas notificações marcadas como lidas: ${userId}`);
  }

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  /**
   * Remove notificação
   */
  async remove(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientId: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    await this.notificationRepository.remove(notification);
  }

  /**
   * Remove todas as notificações lidas
   */
  async removeAllRead(userId: string): Promise<void> {
    await this.notificationRepository.delete({
      recipientId: userId,
      isRead: true,
    });
  }
}
