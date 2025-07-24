import { prismaMock } from '@/prisma/singleton';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import {
  backupData,
  deleteAccount,
  deleteMFA,
  getProfile,
  updateMFA,
  updatePassword,
  updateProfile,
} from './actions';

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  deleteSessionTokenCookie: vi.fn(),
  getCurrentSession: vi.fn(),
  validateSessionToken: vi.fn(),
  revalidatePath: vi.fn(),
  hashPassword: vi.fn(),
  validateTOTP: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
  permanentRedirect: mocks.permanentRedirect,
}));

vi.mock('@/app/login/lib/cookies', () => ({
  deleteSessionTokenCookie: mocks.deleteSessionTokenCookie,
}));

vi.mock('@/app/login/lib/actions', () => ({
  getCurrentSession: mocks.getCurrentSession,
  validateSessionToken: mocks.validateSessionToken,
}));

vi.mock('@/utils/crypto', () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock('@/utils/totp', () => ({
  validateTOTP: mocks.validateTOTP,
}));

vi.mock('next/cache');
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue({ value: 'mockToken' }),
  }),
}));

describe('Profile Actions', () => {
  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('name', 'John Doe');
      formData.append('email', 'john@example.com');

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });

      mocks.getCurrentSession.mockResolvedValue({ user: { id: 1 } });
      mocks.validateSessionToken.mockResolvedValue(true);

      const result = await updateProfile({}, formData);

      expect(result).toBeUndefined();
      expect(revalidatePath).toHaveBeenCalledWith('/profile/1');
      expect(redirect).toHaveBeenCalledWith('/profile/1');
    });

    it('should return error if email already exists', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('name', 'John Doe');
      formData.append('email', 'john@example.com');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 2,
        name: null,
        email: '',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });

      const result = await updateProfile({}, formData);

      expect(result).toEqual({
        message: 'Email already exists.',
        success: false,
      });
    });
  });

  describe('updatePassword', () => {
    const hashedPassword = 'hashedCurrentPassword';
    it('should update password successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('current', 'currentPassword');
      formData.append('password', 'newPassword');
      formData.append('confirm', 'newPassword');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        password: hashedPassword,
        name: null,
        email: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      prismaMock.user.update.mockResolvedValue({
        id: 1,
        name: null,
        email: '',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      mocks.hashPassword.mockReturnValue(hashedPassword);

      const result = await updatePassword({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Password updated successfully.',
      });
    });

    it('should return error if passwords do not match', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('current', 'currentPassword');
      formData.append('password', 'newPassword');
      formData.append('confirm', 'differentPassword');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        password: hashedPassword,
        name: null,
        email: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      mocks.hashPassword.mockReturnValue(hashedPassword);
      const result = await updatePassword({}, formData);

      expect(result).toEqual({
        message: 'Passwords do not match.',
        data: { password: 'newPassword' },
        success: false,
      });
    });
  });

  describe('backupData', () => {
    it('should backup data successfully', async () => {
      const formData = new FormData();
      formData.append('userId', '1');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });

      const result = await backupData({}, formData);

      expect(result.data).toBeDefined();
    });

    it('should return error if user not found', async () => {
      const formData = new FormData();
      formData.append('userId', '1');

      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await backupData({}, formData);

      expect(result).toEqual({
        message: 'User not found.',
        success: false,
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      const formData = new FormData();
      formData.append('userId', '1');
      formData.append('password', 'password');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        name: null,
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      prismaMock.user.delete.mockResolvedValue({
        id: 1,
        name: null,
        email: '',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });

      const result = await deleteAccount({}, formData);

      expect(result).toBeUndefined();
      expect(mocks.deleteSessionTokenCookie).toHaveBeenCalled();
      expect(mocks.permanentRedirect).toHaveBeenCalledWith('/login');
    });

    it('should return error if user not found', async () => {
      const formData = new FormData();
      formData.append('userId', '1');
      formData.append('password', 'password');

      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await deleteAccount({}, formData);

      expect(result).toEqual({
        message: 'You are not allowed to perform this action.',
        success: false,
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile if user is admin', async () => {
      mocks.getCurrentSession.mockResolvedValue({
        user: { id: 1, role: 'admin' },
      });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 2,
        name: null,
        email: '',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });

      const result = await getProfile(2);

      expect(result).toMatchObject({ id: 2 });
    });

    it('should return null if user is not admin and not the owner', async () => {
      mocks.getCurrentSession.mockResolvedValue({
        user: { id: 1, role: 'user' },
      });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 2,
        name: null,
        email: '',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });

      const result = await getProfile(2);

      expect(result).toBeNull();
    });
  });

  describe('updateMFA', () => {
    it('should update MFA successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('secret', 'secret');
      formData.append('password', 'password');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        name: null,
        email: '',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      prismaMock.user.update.mockResolvedValue({
        id: 1,
        name: null,
        email: '',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      mocks.validateTOTP.mockReturnValue(true);

      const result = await updateMFA({}, formData);

      expect(result).toMatchObject({
        success: true,
        message:
          'MFA device has been updated successfully you can refresh this page.',
      });
    });

    it('should return error if OTP is not valid', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('secret', 'secret');
      formData.append('password', 'invalidPassword');
      mocks.validateTOTP.mockReturnValue(false);

      const result = await updateMFA({}, formData);

      expect(result).toEqual({
        data: { secret: 'secret', password: 'invalidPassword' },
        message: 'OTP is not valid.',
      });
    });
  });

  describe('deleteMFA', () => {
    it('should delete MFA successfully', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('password', 'password');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        secret: 'secret',
        name: null,
        email: '',
        password: '',
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      prismaMock.user.update.mockResolvedValue({
        id: 1,
        name: null,
        email: '',
        password: '',
        secret: null,
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      mocks.validateTOTP.mockReturnValue(true);

      const result = await deleteMFA({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Your device has been deleted you can refresh this page.',
      });
    });

    it('should return error if OTP is not valid', async () => {
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('password', 'invalidPassword');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        secret: 'secret',
        name: null,
        email: '',
        password: '',
        mfa: false,
        role: '',
        terms: '',
        sortBoardsBy: 'created_desc',
        sortNotesBy: 'created_desc',
      });
      mocks.validateTOTP.mockReturnValue(false);

      const result = await deleteMFA({}, formData);

      expect(result).toEqual({
        data: { password: 'invalidPassword' },
        message: 'OTP is not valid.',
      });
    });
  });
});
