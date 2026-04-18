import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS } from '../constants/services';
import type { IUsageCheck } from '../interfaces/plan.interface';

export const CREDIT_COST_KEY = 'credit_cost';
export const SetCreditCost = (cost: number) => {
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<unknown>,
  ) => {
    Reflect.defineMetadata(CREDIT_COST_KEY, cost, descriptor.value as object);
    return descriptor;
  };
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return true;

    const creditCost: number =
      this.reflector.get(CREDIT_COST_KEY, context.getHandler()) ?? 1;

    const check = await firstValueFrom<IUsageCheck>(
      this.authClient.send(MESSAGE_PATTERNS.AUTH_CHECK_CREDITS, {
        userId: user.id,
        cost: creditCost,
      }),
    );

    if (!check.allowed) {
      throw new ForbiddenException(
        check.reason ?? 'Insufficient credits. Please upgrade your plan.',
      );
    }

    return true;
  }
}
