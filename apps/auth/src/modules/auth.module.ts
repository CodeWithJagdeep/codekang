import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { RefreshTokenBlacklist } from '../entities/refresh-token-blacklist.entity';
import { Otp } from '../entities/otp.entity';
import { UserSession } from '../entities/user-session.entity';
import { BlacklistCleanupService } from './blacklist-cleanup.service';
import { MailModule } from './mail/mail.module';
import { RazorpayService } from './razorpay.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '15m') },
      }),
    }),
    TypeOrmModule.forFeature([User, RefreshTokenBlacklist, Otp]),
    ScheduleModule.forRoot(),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, BlacklistCleanupService, RazorpayService],
  exports: [AuthService],
})
export class AuthModule {}
