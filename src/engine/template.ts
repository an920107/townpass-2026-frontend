import type { Picks } from '../types';

/** 把 "{image}-{prompt}" 換成目前的選擇。 */
export function fill(template: string, picks: Picks): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => picks[key] ?? '');
}
