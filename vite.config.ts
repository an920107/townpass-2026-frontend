import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base 用相對路徑，同一份 build 放網域根目錄（Vercel）或子路徑（GitHub Pages 專案站）都能跑。
// 情境資料裡的圖片與音檔路徑由 src/scenarios/index.ts 依同一個 base 補上。
export default defineConfig({ base: './', plugins: [react()] });
