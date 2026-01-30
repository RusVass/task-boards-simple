import { describe, expect, it } from 'vitest';
import { validateBoardId, validateBoardName } from './HomePage';

describe('validateBoardName', () => {
  it('returns error for empty string', () => {
    const result = validateBoardName('');
    expect(result.error).toBe('Board name is required');
    expect(result.trimmed).toBe('');
  });

  it('returns error for whitespace only', () => {
    const result = validateBoardName('   ');
    expect(result.error).toBe('Board name is required');
    expect(result.trimmed).toBe('');
  });

  it('returns trimmed value for valid input', () => {
    const result = validateBoardName('  My board  ');
    expect(result.error).toBeNull();
    expect(result.trimmed).toBe('My board');
  });
});

describe('validateBoardId', () => {
  it('returns error for empty string', () => {
    const result = validateBoardId('');
    expect(result.error).toBe('Board id is required');
    expect(result.trimmed).toBe('');
  });

  it('returns error for whitespace only', () => {
    const result = validateBoardId('   ');
    expect(result.error).toBe('Board id is required');
    expect(result.trimmed).toBe('');
  });

  it('returns trimmed value for valid input', () => {
    const result = validateBoardId('  abc-123  ');
    expect(result.error).toBeNull();
    expect(result.trimmed).toBe('abc-123');
  });
});
