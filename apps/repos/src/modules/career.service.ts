import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareerApplication } from '../entities/career.entity';

@Injectable()
export class CareerService {
  constructor(
    @InjectRepository(CareerApplication)
    private readonly repo: Repository<CareerApplication>,
  ) {}

  async apply(data: {
    name: string;
    email: string;
    phone?: string;
    jobSlug: string;
    jobTitle: string;
    resumeUrl?: string;
    coverNote?: string;
  }) {
    const application = this.repo.create(data);
    await this.repo.save(application);
    return { success: true, id: application.id };
  }

  async list() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
