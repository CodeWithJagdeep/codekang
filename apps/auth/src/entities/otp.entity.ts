import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('otps')
export class Otp {
  @PrimaryColumn()
  email: string;

  @Column()
  code: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
