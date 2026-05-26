import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import {
  SupportTicket,
  SupportMessage,
  TicketStatus,
  TicketPriority,
} from '../entities/support.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: TypeOrmRepository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private readonly messageRepo: TypeOrmRepository<SupportMessage>,
  ) {}

  async createTicket(
    userId: string,
    data: {
      subject: string;
      category: string;
      priority: string;
      message: string;
    },
  ) {
    const ticket = this.ticketRepo.create({
      userId,
      subject: data.subject,
      category: data.category,
      priority: data.priority as TicketPriority,
      status: TicketStatus.OPEN,
    });
    await this.ticketRepo.save(ticket);

    const message = this.messageRepo.create({
      ticketId: ticket.id,
      author: 'user',
      content: data.message,
    });
    await this.messageRepo.save(message);

    return this.getTicketWithMessages(ticket.id, userId);
  }

  async listTickets(userId: string) {
    const tickets = await this.ticketRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    const enriched = await Promise.all(
      tickets.map(async (t) => {
        const messages = await this.messageRepo.find({
          where: { ticketId: t.id },
          order: { createdAt: 'ASC' },
        });
        return { ...t, messages };
      }),
    );
    return enriched;
  }

  async replyToTicket(userId: string, ticketId: string, content: string) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, userId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const message = this.messageRepo.create({
      ticketId,
      author: 'user',
      content,
    });
    await this.messageRepo.save(message);

    await this.ticketRepo.update(ticketId, { status: TicketStatus.OPEN });

    return this.getTicketWithMessages(ticketId, userId);
  }

  async resolveTicket(userId: string, ticketId: string) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, userId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.ticketRepo.update(ticketId, { status: TicketStatus.RESOLVED });
    return this.getTicketWithMessages(ticketId, userId);
  }

  private async getTicketWithMessages(ticketId: string, userId: string) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, userId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    const messages = await this.messageRepo.find({
      where: { ticketId: ticket.id },
      order: { createdAt: 'ASC' },
    });
    return { ...ticket, messages };
  }
}
