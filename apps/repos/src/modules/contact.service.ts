import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInquiry } from '../entities/contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactInquiry)
    private readonly repo: Repository<ContactInquiry>,
  ) {}

  async submit(data: { name: string; email: string; company?: string; inquiryType: string; message: string }) {
    const inquiry = this.repo.create(data);
    await this.repo.save(inquiry);
    return { success: true, id: inquiry.id };
  }
}
