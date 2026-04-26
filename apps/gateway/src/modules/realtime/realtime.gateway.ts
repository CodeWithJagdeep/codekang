import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS } from '../../common';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: [
      'http://localhost:3010',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3010',
      'https://codekang.com',
      'https://www.codekang.com',
    ],
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
    @Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const user = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_VALIDATE_TOKEN, { token }),
      );
      client.data.userId = user.id;
      client.join(`user:${user.id}`);

      // Track sockets per user
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(client.id);

      // Push initial notification count on connect
      this.pushNotificationCount(user.id);

      this.logger.log(`Client connected: ${client.id} (user ${user.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { ts: Date.now() });
  }

  @SubscribeMessage('notifications:request_count')
  async handleRequestCount(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (userId) await this.pushNotificationCount(userId);
  }

  /** Called by internal services to emit events to a user */
  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /** Push notification unread count to a specific user */
  async pushNotificationCount(userId: string) {
    try {
      const result = await firstValueFrom(
        this.reposClient.send(MESSAGE_PATTERNS.NOTIF_UNREAD_COUNT, { userId }),
      );
      this.emitToUser(userId, 'notification:count', { count: result?.count ?? result ?? 0 });
    } catch {
      // Ignore errors - repos service may not be running
    }
  }

  /** Push a new notification to a user */
  pushNotification(userId: string, notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    createdAt: string;
  }) {
    this.emitToUser(userId, 'notification:new', notification);
  }

  /** Push an activity event (PR, agent, security) to a user */
  pushActivity(userId: string, activity: {
    type: 'pr_review' | 'agent_run' | 'security' | 'issue';
    status: 'started' | 'completed' | 'failed';
    title: string;
    detail?: string;
    repoName?: string;
    link?: string;
    ts: number;
  }) {
    this.emitToUser(userId, 'activity:event', activity);
  }
}
