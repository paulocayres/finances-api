import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;

  constructor() {
    const keyEnv = process.env.ENCRYPTION_KEY;
    if (!keyEnv) {
      this.logger.error('ENCRYPTION_KEY not set. Encryption will fail.');
      throw new Error('ENCRYPTION_KEY not set');
    }
    this.key = Buffer.from(keyEnv, 'base64');
    if (this.key.length !== 32) {
      this.logger.error('ENCRYPTION_KEY must be 32 bytes (base64-encoded).');
      throw new Error('ENCRYPTION_KEY invalid length');
    }
  }

  encrypt(plain: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGO, this.key, iv, { authTagLength: TAG_LENGTH });
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(token: string): string {
    const buff = Buffer.from(token, 'base64');
    const iv = buff.slice(0, IV_LENGTH);
    const tag = buff.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const enc = buff.slice(IV_LENGTH + TAG_LENGTH);
    const decipher = createDecipheriv(ALGO, this.key, iv, { authTagLength: TAG_LENGTH });
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString('utf8');
  }

  // helper to detect likely-encrypted values (base64 length heuristic)
  looksEncrypted(value: any): boolean {
    if (typeof value !== 'string') return false;
    // base64 characters and typical length (iv+tag+ciphertext) - quick heuristic
    return /^[A-Za-z0-9+/=]+$/.test(value) && value.length >= 32;
  }
}
