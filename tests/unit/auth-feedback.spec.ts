import { describe, it, expect } from 'vitest';
import { normalizeLoginFeedback, LOGIN_FEEDBACK_MESSAGE } from '@/utils/auth-feedback';

describe('normalizeLoginFeedback', () => {
  it('should return null for undefined input', () => {
    expect(normalizeLoginFeedback(undefined)).toBeNull();
  });

  it('should return null for empty string or whitespace-only strings', () => {
    expect(normalizeLoginFeedback('')).toBeNull();
    expect(normalizeLoginFeedback('   ')).toBeNull();
  });

  it('should return LOGIN_FEEDBACK_MESSAGE for legacy feedback messages', () => {
    expect(normalizeLoginFeedback('could not authenticate user')).toBe(LOGIN_FEEDBACK_MESSAGE);
    expect(normalizeLoginFeedback('invalid login credentials')).toBe(LOGIN_FEEDBACK_MESSAGE);
  });

  it('should be case-insensitive for legacy messages', () => {
    expect(normalizeLoginFeedback('COULD NOT AUTHENTICATE USER')).toBe(LOGIN_FEEDBACK_MESSAGE);
    expect(normalizeLoginFeedback('Invalid Login Credentials')).toBe(LOGIN_FEEDBACK_MESSAGE);
  });

  it('should trim legacy messages before matching', () => {
    expect(normalizeLoginFeedback('  invalid login credentials  ')).toBe(LOGIN_FEEDBACK_MESSAGE);
  });

  it('should return the first element if input is an array', () => {
    expect(normalizeLoginFeedback(['custom error', 'other error'])).toBe('custom error');
    expect(normalizeLoginFeedback(['invalid login credentials', 'other error'])).toBe(LOGIN_FEEDBACK_MESSAGE);
  });

  it('should return trimmed non-legacy messages', () => {
    expect(normalizeLoginFeedback('Email not verified')).toBe('Email not verified');
    expect(normalizeLoginFeedback('  User not found  ')).toBe('User not found');
  });

  it('should handle array with empty strings by returning null', () => {
    expect(normalizeLoginFeedback(['', 'something else'])).toBeNull();
    expect(normalizeLoginFeedback(['   '])).toBeNull();
  });
});
