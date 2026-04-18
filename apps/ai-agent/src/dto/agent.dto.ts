import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;
}

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  userId: string;
}
