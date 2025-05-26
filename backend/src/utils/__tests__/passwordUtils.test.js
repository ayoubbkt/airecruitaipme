// src/utils/__tests__/passwordUtils.test.js
import { hashPassword, comparePassword } from '../passwordUtils.js';

describe('Password Utilities', () => {
  const plainPassword = 'password123';
  let hashedPassword;

  it('should hash a password', async () => {
    hashedPassword = await hashPassword(plainPassword);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(plainPassword);
  });

  it('should compare a plain password with a hashed password correctly (valid)', async () => {
    const isMatch = await comparePassword(plainPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should compare a plain password with a hashed password correctly (invalid)', async () => {
    const isMatch = await comparePassword('wrongpassword', hashedPassword);
    expect(isMatch).toBe(false);
  });
});