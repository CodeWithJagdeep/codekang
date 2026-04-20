import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  UseGuards,
  Inject,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS, JwtAuthGuard, CurrentUser } from '../../common';
import type { IUser } from '../../common';

class CreateCheckoutDto {
  @IsEnum(['starter', 'pro', 'team'])
  plan: 'starter' | 'pro' | 'team';

  @IsEnum(['monthly', 'annual'])
  interval: 'monthly' | 'annual';

  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}

class CreatePortalDto {
  @IsOptional()
  @IsUrl()
  returnUrl?: string;
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    @Inject(SERVICES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe checkout session with 7-day trial' })
  @ApiBody({ type: CreateCheckoutDto })
  async createCheckout(
    @CurrentUser() user: IUser,
    @Body() body: CreateCheckoutDto,
  ) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3010';
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.BILLING_CREATE_CHECKOUT, {
        userId: user.id,
        planTier: body.plan,
        interval: body.interval,
        successUrl: body.successUrl ?? `${frontendUrl}/settings/billing?checkout=success`,
        cancelUrl: body.cancelUrl ?? `${frontendUrl}/settings/billing?checkout=canceled`,
      }),
    );
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe billing portal session to manage subscription' })
  @ApiBody({ type: CreatePortalDto })
  async createPortal(
    @CurrentUser() user: IUser,
    @Body() body: CreatePortalDto,
  ) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3010';
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.BILLING_CREATE_PORTAL, {
        userId: user.id,
        returnUrl: body.returnUrl ?? `${frontendUrl}/settings/billing`,
      }),
    );
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current billing subscription status and details' })
  async getSubscription(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.BILLING_GET_SUBSCRIPTION, {
        userId: user.id,
      }),
    );
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List past invoices for the current user' })
  async getInvoices(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.BILLING_GET_INVOICES, {
        userId: user.id,
      }),
    );
  }

  @Delete('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription at the end of the current billing period' })
  async cancelSubscription(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.BILLING_CANCEL_SUBSCRIPTION, {
        userId: user.id,
      }),
    );
  }

  // ─── Stripe webhook — no auth guard, verified by Stripe signature ─────────
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint (Stripe-Signature required)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { received: false, error: 'No raw body available' };
    }

    await firstValueFrom(
      this.authClient.send(MESSAGE_PATTERNS.BILLING_HANDLE_WEBHOOK, {
        payload: Array.from(rawBody),
        signature,
      }),
    );

    return { received: true };
  }
}
