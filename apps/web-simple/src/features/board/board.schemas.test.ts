import { describe, expect, it } from 'vitest';
import { boardIdSchema, boardNameSchema, cardSchema, normalizeString } from './board.schemas';

describe('board.schemas', () => {
  it('rejects empty board id after trim', () => {
    const result = boardIdSchema.safeParse('   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Field is required');
    }
  });

  it('rejects invalid board id format', () => {
    const result = boardIdSchema.safeParse('invalid-id');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Board ID must be 24 hex characters');
    }
  });

  it('accepts valid board id format', () => {
    const parsed = boardIdSchema.parse('  a1b2c3d4e5f6a7b8c9d0e1f2  ');
    expect(parsed).toBe('a1b2c3d4e5f6a7b8c9d0e1f2');
  });

  it('trims and validates board name length', () => {
    const longName = 'a'.repeat(61);
    const longResult = boardNameSchema.safeParse(longName);

    expect(longResult.success).toBe(false);
    if (!longResult.success) {
      expect(longResult.error.issues[0]?.message).toBe('Max 60 characters');
    }

    const parsed = boardNameSchema.parse('  Board  ');
    expect(parsed).toBe('Board');
  });

  it('provides default description and trims card fields', () => {
    const parsed = cardSchema.parse({ title: '  Title  ' });

    expect(parsed.title).toBe('Title');
    expect(parsed.description).toBe('');
  });

  it('rejects empty card title', () => {
    const result = cardSchema.safeParse({ title: '   ', description: 'x' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Title is required');
    }
  });

  it('normalizes strings with trim', () => {
    expect(normalizeString('  ok ')).toBe('ok');
  });
});
