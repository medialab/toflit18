/**
 * TOFLIT18 Crypto Utility
 * ========================
 *
 * Providing a generic method to hash the system's passwords.
 */
import crypto from 'crypto';
import config from 'config';

const secret = config.get('api.secret');

export function hash(s) {
  const shasum = crypto.createHash('sha256');
  shasum.update(s + secret);
  return shasum.digest('hex');
}
