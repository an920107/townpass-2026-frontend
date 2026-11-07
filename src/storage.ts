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
