import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import { encrypt, decrypt } from '../utils/encryption';

@Entity('user_integrations')
@Index(['userId', 'provider'], { unique: true })
export class UserIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 50 })
  provider: string;

  @Column({ default: 'connected' })
  status: string;

  // Stores AES-256-GCM encrypted JSON of the full config (tokens, webhook URLs, etc.)
  @Column({ name: 'access_token', nullable: true, type: 'text' })
  accessToken: string | null;

  // In-memory only — never persisted directly. Populated from accessToken on load.
  config: Record<string, unknown>;

  @CreateDateColumn({ name: 'connected_at' })
  connectedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  encryptConfig(): void {
    const data = this.config ?? {};
    this.accessToken = encrypt(JSON.stringify(data));
    // config intentionally not persisted — it has no @Column decorator
  }

  @AfterLoad()
  decryptConfig(): void {
    if (!this.accessToken) {
      this.config = {};
      return;
    }
    try {
      this.config = JSON.parse(decrypt(this.accessToken)) as Record<
        string,
        unknown
      >;
    } catch {
      // Graceful fallback for rows written before encryption was added
      try {
        this.config = JSON.parse(this.accessToken) as Record<string, unknown>;
      } catch {
        this.config = {};
      }
    }
  }
}
