import type { Scenario } from '../types';
import document from './document.json';
import fraud from './fraud.json';
import search from './search.json';
import travel from './travel.json';
import voice from './voice.json';

// JSON 匯入時字串型別會被放寬，內容由 scenarios.test.ts 在建置時檢查。
export const scenarios = [voice, document, search, travel, fraud] as unknown as Scenario[];
