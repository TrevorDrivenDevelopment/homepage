import { describe, expect, test } from 'bun:test';
import {
  calculateMBTIFromStack,
  calculateEIOrientation,
  checkAttentionCheck,
} from './mbtiCalculations';
import { CognitiveFunction } from './types/mbti';
import type { Response } from './types/mbti';

// Helper to build a cognitive function stack entry
const fn = (
  introverted: string,
  extroverted: string,
  isExtroverted: boolean
): CognitiveFunction => ({ introverted, extroverted, isExtroverted });

describe('calculateMBTIFromStack', () => {
  test('determines E/I from the attitude of the dominant function', () => {
    const introvertedDomStack: CognitiveFunction[] = [
      fn('Ni', 'Ne', false),
      fn('Ti', 'Te', true),
      fn('Fi', 'Fe', false),
      fn('Si', 'Se', true),
    ];
    expect(calculateMBTIFromStack(introvertedDomStack)[0]).toBe('I');

    const extrovertedDomStack: CognitiveFunction[] = [
      fn('Ni', 'Ne', true),
      fn('Ti', 'Te', false),
      fn('Fi', 'Fe', true),
      fn('Si', 'Se', false),
    ];
    expect(calculateMBTIFromStack(extrovertedDomStack)[0]).toBe('E');
  });

  test('determines N/S based on which of Ni/Ne or Si/Se appears earlier in the stack', () => {
    const intuitionFirst: CognitiveFunction[] = [
      fn('Ni', 'Ne', false),
      fn('Ti', 'Te', true),
      fn('Fi', 'Fe', false),
      fn('Si', 'Se', true),
    ];
    expect(calculateMBTIFromStack(intuitionFirst)[1]).toBe('N');

    const sensingFirst: CognitiveFunction[] = [
      fn('Si', 'Se', false),
      fn('Ti', 'Te', true),
      fn('Fi', 'Fe', false),
      fn('Ni', 'Ne', true),
    ];
    expect(calculateMBTIFromStack(sensingFirst)[1]).toBe('S');
  });

  test('determines T/F based on which of Ti/Te or Fi/Fe appears earlier in the stack', () => {
    const thinkingFirst: CognitiveFunction[] = [
      fn('Ni', 'Ne', false),
      fn('Ti', 'Te', true),
      fn('Fi', 'Fe', false),
      fn('Si', 'Se', true),
    ];
    expect(calculateMBTIFromStack(thinkingFirst)[2]).toBe('T');

    const feelingFirst: CognitiveFunction[] = [
      fn('Ni', 'Ne', false),
      fn('Fi', 'Fe', true),
      fn('Ti', 'Te', false),
      fn('Si', 'Se', true),
    ];
    expect(calculateMBTIFromStack(feelingFirst)[2]).toBe('F');
  });

  test('is deterministic for the same input stack', () => {
    const stack: CognitiveFunction[] = [
      fn('Ni', 'Ne', false),
      fn('Ti', 'Te', true),
      fn('Fi', 'Fe', false),
      fn('Si', 'Se', true),
    ];
    const first = calculateMBTIFromStack(stack);
    const second = calculateMBTIFromStack(stack);
    expect(first).toBe(second);
    expect(first).toMatch(/^[EI][SN][TF][JP]$/);
  });

  test('returns XXXX for an invalid stack with duplicate active functions', () => {
    const stack: CognitiveFunction[] = [
      fn('Ni', 'Ne', false),
      fn('Ni', 'Ne', false), // duplicate active function (Ni again)
      fn('Fi', 'Fe', false),
      fn('Si', 'Se', true),
    ];
    expect(calculateMBTIFromStack(stack)).toBe('XXXX');
  });

  test('returns XXXX for an incomplete stack (fewer than 4 functions)', () => {
    const stack: CognitiveFunction[] = [
      fn('Ni', 'Ne', false),
      fn('Ti', 'Te', true),
    ];
    expect(calculateMBTIFromStack(stack)).toBe('XXXX');
  });
});

describe('calculateMBTIFromStack - J/P determination', () => {
  test('ENTJ: extraverted judging dominant with introverted perceiving auxiliary is J', () => {
    const stack: CognitiveFunction[] = [
      fn('Ti', 'Te', true), // dominant Te (extraverted, judging)
      fn('Ni', 'Ne', false), // auxiliary Ni (introverted, perceiving)
      fn('Fi', 'Fe', false),
      fn('Si', 'Se', true),
    ];
    expect(calculateMBTIFromStack(stack)).toBe('ENTJ');
  });

  test('INTJ: introverted perceiving dominant with extraverted judging auxiliary is J', () => {
    const stack: CognitiveFunction[] = [
      fn('Ni', 'Ne', false), // dominant Ni (introverted, perceiving)
      fn('Ti', 'Te', true), // auxiliary Te (extraverted, judging)
      fn('Fi', 'Fe', false),
      fn('Si', 'Se', true),
    ];
    expect(calculateMBTIFromStack(stack)).toBe('INTJ');
  });

  test('ESTP: extraverted perceiving dominant with introverted judging auxiliary is P', () => {
    const stack: CognitiveFunction[] = [
      fn('Si', 'Se', true), // dominant Se (extraverted, perceiving)
      fn('Ti', 'Te', false), // auxiliary Ti (introverted, judging)
      fn('Fi', 'Fe', true),
      fn('Ni', 'Ne', false),
    ];
    expect(calculateMBTIFromStack(stack)).toBe('ESTP');
  });

  test('ISTP: introverted judging dominant with extraverted perceiving auxiliary is P', () => {
    const stack: CognitiveFunction[] = [
      fn('Ti', 'Te', false), // dominant Ti (introverted, judging)
      fn('Si', 'Se', true), // auxiliary Se (extraverted, perceiving)
      fn('Fi', 'Fe', false),
      fn('Ni', 'Ne', true),
    ];
    expect(calculateMBTIFromStack(stack)).toBe('ISTP');
  });
});


describe('calculateEIOrientation', () => {
  test('returns Undetermined when no ei-orientation questions are answered', () => {
    const result = calculateEIOrientation([]);
    expect(result.label).toBe('Undetermined');
    expect(result.answeredCount).toBe(0);
  });

  test('leans Extrovert when ei-orientation responses skew strongly positive', () => {
    const responses: Response[] = [
      { questionId: 'ei-1', value: 2 },
      { questionId: 'ei-2', value: 2 },
    ];
    const result = calculateEIOrientation(responses);
    expect(result.answeredCount).toBe(2);
    expect(result.label).toBe('Extrovert');
  });

  test('leans Introvert when ei-orientation responses skew strongly negative', () => {
    const responses: Response[] = [
      { questionId: 'ei-1', value: -2 },
      { questionId: 'ei-2', value: -2 },
    ];
    const result = calculateEIOrientation(responses);
    expect(result.label).toBe('Introvert');
    expect(result.answeredCount).toBe(2);
  });
});

describe('checkAttentionCheck', () => {
  test('passes when no attention-check question was answered', () => {
    const result = checkAttentionCheck([]);
    expect(result.checked).toBe(false);
    expect(result.passed).toBe(true);
  });

  test('passes when the expected value was selected', () => {
    const responses: Response[] = [{ questionId: 'attn-1', value: 1 }];
    const result = checkAttentionCheck(responses);
    expect(result.checked).toBe(true);
    expect(result.passed).toBe(true);
  });

  test('fails when a different value was selected', () => {
    const responses: Response[] = [{ questionId: 'attn-1', value: -2 }];
    const result = checkAttentionCheck(responses);
    expect(result.checked).toBe(true);
    expect(result.passed).toBe(false);
  });
});
