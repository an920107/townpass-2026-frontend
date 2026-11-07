import { describe, expect, it } from 'vitest';
import { scenarios } from '.';
import { validate } from './validate';

describe('scenarios', () => {
  it('lists the five scenarios in menu order', () => {
    expect(scenarios.map((s) => s.title)).toEqual([
      '開口問 AI',
      '看懂文件',
      '查資料',
      '旅遊規劃',
      '辨識詐騙',
    ]);
  });

  it.each(scenarios.map((s) => [s.id, s] as const))('%s has data for every path', (_, scenario) => {
    expect(validate(scenario)).toEqual([]);
  });
});
