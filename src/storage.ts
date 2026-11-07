const KEY = 'ai-village-completed';

export function loadCompleted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function saveCompleted(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // 無法儲存時，只是下次不顯示打勾。
  }
}

/** 只給除錯用：清掉完成紀錄，下次載入就是全新狀態。 */
export function clearCompleted() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 無法清除時，重新載入還是會看到舊的完成狀態。
  }
}
