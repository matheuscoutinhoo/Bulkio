import { describe, expect, it } from 'vitest';
import { changePasswordSchema } from '../../models/schemas';

describe('change password validation', () => {
   it('accepts current and new passwords without trimming significant spaces', () => {
      const data = { currentPassword: ' old-password ', newPassword: ' new-password ' };
      expect(changePasswordSchema.parse(data)).toEqual(data);
   });
   it.each([
      { currentPassword: '', newPassword: 'new-password' },
      { currentPassword: 'old-password', newPassword: 'short' },
      { currentPassword: 'old-password', newPassword: 'a'.repeat(73) },
      { currentPassword: 'old-password', newPassword: '😀'.repeat(20) },
   ])('rejects missing, short or bcrypt-truncated credentials', (data) => {
      expect(changePasswordSchema.safeParse(data).success).toBe(false);
   });
});
