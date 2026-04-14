import { describe, it, expect } from 'vitest';
import { parseGitHubUrl, normalizeGitHubRepoUrl } from '@/utils/github-url';

describe('utils/github-url', () => {
  describe('parseGitHubUrl', () => {
    it('correctly parses standard repo URLs', () => {
      expect(parseGitHubUrl('https://github.com/vercel/next.js')).toEqual({
        owner: 'vercel',
        repo: 'next.js',
      });
    });

    it('handles URLs with extra paths', () => {
      expect(parseGitHubUrl('https://github.com/facebook/react/tree/main/packages')).toEqual({
        owner: 'facebook',
        repo: 'react',
      });
    });

    it('handles www.github.com', () => {
      expect(parseGitHubUrl('https://www.github.com/owner/repo')).toEqual({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('returns null for non-github URLs', () => {
      expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
    });

    it('returns null for malformed URLs', () => {
      expect(parseGitHubUrl('not-a-url')).toBeNull();
      expect(parseGitHubUrl('https://github.com/just-owner')).toBeNull();
    });

    it('returns null for empty strings', () => {
      expect(parseGitHubUrl('')).toBeNull();
    });

    it('returns null for owner or repo with invalid characters', () => {
        expect(parseGitHubUrl('https://github.com/owner!/repo')).toBeNull();
        expect(parseGitHubUrl('https://github.com/owner/repo%21')).toBeNull();
        expect(parseGitHubUrl('https://github.com/owner/repo%3F')).toBeNull();
        expect(parseGitHubUrl('https://github.com/owner/repo%23')).toBeNull();
    });
  });

  describe('normalizeGitHubRepoUrl', () => {
    it('normalizes www + extra paths to canonical repo URL', () => {
      expect(
        normalizeGitHubRepoUrl('https://www.github.com/facebook/react/tree/main/packages'),
      ).toBe('https://github.com/facebook/react');
    });

    it('strips .git suffix', () => {
      expect(normalizeGitHubRepoUrl('https://github.com/owner/repo.git')).toBe(
        'https://github.com/owner/repo',
      );
    });

    it('supports scp-like git@github.com URLs', () => {
      expect(normalizeGitHubRepoUrl('git@github.com:owner/repo.git')).toBe(
        'https://github.com/owner/repo',
      );
    });
  });
});
