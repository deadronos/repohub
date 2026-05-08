import { describe, it, expect } from 'vitest';
import { stripTitlePrefix } from '@/utils/projects/description';

describe('stripTitlePrefix', () => {
  it('strips title followed by dash separator', () => {
    expect(stripTitlePrefix('Idle Dungeon Crawler', 'Idle Dungeon Crawler - A browser-based RPG')).toBe(
      'A browser-based RPG',
    );
  });

  it('strips title followed by colon separator', () => {
    expect(stripTitlePrefix('React App', 'React App: A standalone tool')).toBe('A standalone tool');
  });

  it('returns description unchanged when title is not a prefix', () => {
    expect(stripTitlePrefix('React App', 'A standalone tool')).toBe('A standalone tool');
  });

  it('handles case-insensitive title match', () => {
    expect(stripTitlePrefix('my project', 'My Project is great')).toBe('is great');
  });

  it('returns empty string for null description', () => {
    expect(stripTitlePrefix('Title', null)).toBe('');
  });

  it('returns empty string for undefined description', () => {
    expect(stripTitlePrefix('Title', undefined)).toBe('');
  });

  it('returns empty string for empty description', () => {
    expect(stripTitlePrefix('Title', '')).toBe('');
  });

  it('returns original description when stripping leaves nothing', () => {
    expect(stripTitlePrefix('Hello', 'Hello')).toBe('Hello');
  });

  it('strips title followed by em-dash', () => {
    expect(stripTitlePrefix('Widget', 'Widget — a cool thing')).toBe('a cool thing');
  });

  it('strips title followed by semicolon', () => {
    expect(stripTitlePrefix('Widget', 'Widget; a cool thing')).toBe('a cool thing');
  });

  it('trims whitespace from description before processing', () => {
    expect(stripTitlePrefix('App', '  App - something  ')).toBe('something');
  });
});