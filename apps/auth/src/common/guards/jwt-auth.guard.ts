import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS } from '../constants/services';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const user = await firstValueFrom(
        this.authClient.send(MESSAGE_PATTERNS.AUTH_VALIDATE_TOKEN, { token }),
      );
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Record<string, any>): string | null {
    const authHeader = request.headers?.authorization as string | undefined;
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
    return null;
  }
}
