# AI 學習村

台北通 City Service 的長者 AI 互動教學。全程模擬，不呼叫真實 AI，也不使用麥克風或讀取真實檔案。

## 開發

```bash
npm install
npm run dev     # 本機預覽
npm run build   # 型別檢查、情境資料檢查、打包到 dist/
```

### 除錯

連續點選單右上角的「已完成 x 個」5 下，會清掉 localStorage 的完成紀錄，回到全新狀態。
兩下之間停頓超過 1.5 秒就重新數，所以慢慢點不會誤觸。（`src/modules/ScenarioMenu.tsx`）

## 設計

介面沿用台北通 App（`townpass-2026`）的設計系統，不另外發明一套：

- `src/styles/tokens.css`：色票與字重對應 `lib/util/tp_colors.dart`、`tp_text_styles.dart`；圓角與陰影對應 `tp_button`、`tp_card`、`tp_bottom_sheet`；動態時長與 easing 用 Material 3 的標準值。
- 頁面不自己畫 AppBar：這個前端是以 webview 開在 App 裡，上方那條由 `TPWebView` 的 `TPAppBar` 提供（標題、webview 上一頁、關閉）。版面比照 TP 的訊息列表（灰底、細分隔線），底部面板比照 `TPBottomSheet`。
- 長者版只放大字級（內文 20px、說明 16px，字重仍用 400/600），並在需要對比的地方改用 `primary-600`／`primary-700`：`primary-500` 配白字只有 2.2:1。
- 換步驟時光點會滑向新目標、遮罩淡出而不是直接抽掉（`src/modules/Spotlight.tsx`）；`prefers-reduced-motion` 時直接到位。

## 部署

這個 repo 就是網站根目錄（`index.html` 在根層），部署時不需要再指定子目錄。在 Vercel 建專案時 Root Directory 留預設 `./`、框架選 Vite。部署後把網址填入 app 的 `MyServiceItemId.aiVillage`。

### GitHub Pages

推到 `main` 之後 `.github/workflows/deploy-pages.yml` 會建置並部署到 `https://bp-xzs.github.io/townpass-2026-frontend/`；repo 的 Pages 設定要把 Source 選成「GitHub Actions」（免費方案需要 repo 為 public）。

同一份 build 放在網域根目錄或子路徑都能跑：`vite.config.ts` 的 `base: './'` 讓 HTML 用相對路徑，情境資料裡的 `/images/...`、`/audio/...` 則由 `src/scenarios/index.ts` 接上 `BASE_URL`。所以換部署位置不用改任何網址設定。頁面只有在進入情境時 push 一筆 history state、不換 URL，因此也不需要 SPA fallback 或 `404.html`。

## 新增或修改情境

情境資料在 `src/scenarios/*.json`，新增後要加進 `src/scenarios/index.ts`。步驟種類定義在 `src/types.ts`。

`npm run build` 會走過每個情境的所有選擇組合，缺回覆或缺提問時會失敗。

## 音檔

把 wav 放在 `public/audio/`，檔案還沒到位時喇叭只有動畫，流程不會卡住。

| 檔名 | 內容 |
|---|---|
| `voice-mrt.wav` | `voice.json` 的 `mrt` 回覆 |
| `document-star.wav` | `document.json` 的 `star` 回覆 |
| `document-address.wav` | `document.json` 的 `address` 回覆 |
| `document-agent.wav` | `document.json` 的 `agent` 回覆 |
