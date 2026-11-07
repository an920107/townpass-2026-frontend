import { fill } from '../engine/template';
import type { Picks, Scenario } from '../types';

const STEP_TYPES = new Set([
  'tap',
  'attach',
  'prompt',
  'send',
  'voice',
  'play',
  'done',
]);
const TARGETS = new Set(['plus', 'input', 'mic', 'send', 'speaker', 'like']);

/** 走過所有選擇組合，回傳缺資料的問題清單。 */
export function validate(scenario: Scenario): string[] {
  const errors: string[] = [];
  const add = (text: string) => errors.push(`${scenario.id}: ${text}`);
  const { steps, replies, prompts } = scenario;

  if (steps[steps.length - 1]?.type !== 'done') add('最後一步必須是 done');

  const walk = (index: number, picks: Picks) => {
    const step = steps[index];
    if (!step) return;
    if (!STEP_TYPES.has(step.type)) add(`${step.id} 的 type 不存在`);

    switch (step.type) {
      case 'tap':
        if (!TARGETS.has(step.target)) add(`${step.id} 的 target 不存在`);
        break;
      case 'send':
        if (!replies[fill(step.reply, picks)]) add(`${step.id} 缺回覆 ${fill(step.reply, picks)}`);
        break;
      case 'prompt': {
        let next = picks;
        if (step.flip) {
          const { pick, map } = step.flip;
          next = { ...picks, [pick]: map[picks[pick]] };
        }
        if (step.text !== undefined && !prompts?.[fill(step.text, next)]) {
          add(`${step.id} 缺提問 ${fill(step.text, next)}`);
        }
        const { pick, options } = step;
        if (options && pick) {
          for (const option of options) walk(index + 1, { ...next, [pick]: option.id });
        } else {
          walk(index + 1, next);
        }
        return;
      }
      case 'attach':
        for (const option of step.options) {
          if (!option.image) add(`${step.id} 的 ${option.id} 缺圖片`);
          walk(index + 1, { ...picks, [step.pick]: option.id });
        }
        return;
    }
    walk(index + 1, picks);
  };

  walk(0, {});
  return errors;
}
