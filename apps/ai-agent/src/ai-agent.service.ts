import { Injectable } from '@nestjs/common';

@Injectable()
export class AiAgentService {
  getHello(): string {
    return 'Hello World!';
  }
}
