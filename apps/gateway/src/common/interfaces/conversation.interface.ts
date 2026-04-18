export type MessageRole = 'user' | 'assistant' | 'system';

export interface IMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface IConversation {
  id: string;
  userId: string;
  title: string;
  messages: IMessage[];
  repoOwner?: string;
  repoName?: string;
  issueNumber?: number;
  issueTitle?: string;
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}
