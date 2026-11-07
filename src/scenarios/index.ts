import type { Scenario } from '../types';
import document from './document.json';
import fraud from './fraud.json';
import search from './search.json';
import travel from './travel.json';
import voice from './voice.json';

/** 情境資料裡代表檔案的欄位。 */
const ASSET_KEYS = new Set(['image', 'audio']);

/**
 * 情境資料寫的是 `/images/...`、`/audio/...`，開頭的斜線代表「App 根目錄」。
 * JSON 不會像 index.html 那樣被 Vite 改寫，所以在這裡統一接上部署基底，
 * 讓圖片與音檔跟著 build 一起換目錄（網域根目錄或 /repo/ 子路徑都可以）。
 */
function withBase(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withBase);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      ASSET_KEYS.has(key) && typeof child === 'string'
        ? `${import.meta.env.BASE_URL}${child.replace(/^\//, '')}`
        : withBase(child),
    ]),
  );
}

// JSON 匯入時字串型別會被放寬，內容由 scenarios.test.ts 在建置時檢查。
export const scenarios = [voice, document, search, travel, fraud].map(
  (scenario) => withBase(scenario),
) as Scenario[];
