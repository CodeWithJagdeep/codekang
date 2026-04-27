import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from '../entities/newsletter.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repo: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(email: string, source = 'footer') {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await this.repo.save(existing);
        return { success: true, message: 'Resubscribed successfully.' };
      }
      return { success: true, message: 'Already subscribed.' };
    }
    await this.repo.save(this.repo.create({ email, source }));
    return { success: true, message: 'Subscribed successfully.' };
  }
}
