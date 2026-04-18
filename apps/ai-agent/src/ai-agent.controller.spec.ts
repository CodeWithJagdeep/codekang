import { Test, TestingModule } from '@nestjs/testing';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';

describe('AiAgentController', () => {
  let aiAgentController: AiAgentController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AiAgentController],
      providers: [AiAgentService],
    }).compile();

    aiAgentController = app.get<AiAgentController>(AiAgentController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(aiAgentController.getHello()).toBe('Hello World!');
    });
  });
});
