import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * WordPress Hash Validation Utility
 * Supports WordPress password hash formats: $P$B, $wp$, $P$, $2a$ (bcrypt)
 */
export class WordPressHashUtil {
  /**
   * Validates a password against a WordPress hash
   */
  static async validateWordPressPassword(
    password: string,
    wpHash: string,
  ): Promise<boolean> {
    if (!wpHash || !password) {
      return false;
    }

    // Handle bcrypt hashes ($2a$)
    if (wpHash.startsWith('$2a$') || wpHash.startsWith('$2b$') || wpHash.startsWith('$2y$')) {
      try {
        return await bcrypt.compare(password, wpHash);
      } catch {
        return false;
      }
    }

    // Handle phpass MD5-based hashes
    if (wpHash.startsWith('$P$B')) {
      return this.validatePBPHash(password, wpHash);
    }

    if (wpHash.startsWith('$wp$')) {
      return this.validatePBPHash(password, wpHash);
    }

    if (wpHash.startsWith('$P$')) {
      return this.validatePBPHash(password, wpHash);
    }

    if (wpHash.startsWith('$H$')) {
      return this.validatePBPHash(password, wpHash);
    }

    return false;
  }

  /**
   * Validates phpass MD5-based hash (used by $P$B, $wp$, $P$, $H$)
   */
  private static validatePBPHash(password: string, wpHash: string): boolean {
    const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    if (wpHash.length < 34) return false;

    // The iteration count is encoded in the 4th character
    const countLog2 = itoa64.indexOf(wpHash[3]);
    if (countLog2 < 7 || countLog2 > 31) return false;

    const count = 1 << countLog2;
    const salt = wpHash.substring(4, 12);

    let hash = crypto.createHash('md5').update(salt + password).digest();

    for (let i = 0; i < count; i++) {
      hash = crypto.createHash('md5').update(Buffer.concat([hash, Buffer.from(password)])).digest();
    }

    return this.encode64(hash, 16) === wpHash.substring(12);
  }

  /**
   * Encodes hash to base64-like format (PHPass style)
   */
  private static encode64(input: Buffer, count: number): string {
    const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let output = '';
    let i = 0;

    while (i < count) {
      let value = input[i++];
      output += itoa64[value & 0x3f];

      if (i < count) {
        value |= input[i] << 8;
      }
      output += itoa64[(value >> 6) & 0x3f];

      if (i++ >= count) break;

      if (i < count) {
        value |= input[i] << 16;
      }
      output += itoa64[(value >> 12) & 0x3f];

      if (i++ >= count) break;

      output += itoa64[(value >> 18) & 0x3f];
    }

    return output;
  }
}
