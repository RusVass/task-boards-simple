import { describe, expect, it } from 'vitest';
import { getLoadBoardErrorMessage, validateBoardId, validateBoardName } from './home-page.utils';

describe('validateBoardName', () => {
  it('returns error for empty string', () => {
    const result = validateBoardName('');
    expect(result.error).toBe('Field is required');
    expect(result.trimmed).toBe('');
  });

  it('returns error for whitespace only', () => {
    const result = validateBoardName('   ');
    expect(result.error).toBe('Field is required');
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
    expect(result.error).toBe('Field is required');
    expect(result.trimmed).toBe('');
  });

  it('returns error for whitespace only', () => {
    const result = validateBoardId('   ');
    expect(result.error).toBe('Field is required');
    expect(result.trimmed).toBe('');
  });

  it('returns trimmed value for valid input', () => {
    const result = validateBoardId('  abc-123  ');
    expect(result.error).toBeNull();
    expect(result.trimmed).toBe('abc-123');
  });
});

describe('getLoadBoardErrorMessage', () => {
  it('returns API message when board is not found', () => {
    const error = { response: { status: 404, data: { message: 'Board not found' } } };
    expect(getLoadBoardErrorMessage(error)).toBe('Board not found');
  });

  it('returns default not found message without API message', () => {
    const error = { response: { status: 404, data: {} } };
    expect(getLoadBoardErrorMessage(error)).toBe('Board not found');
  });

  it('returns fallback for unknown error shape', () => {
    expect(getLoadBoardErrorMessage(null)).toBe('Load failed, check API server');
  });
});
