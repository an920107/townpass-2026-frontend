export type Target = 'plus' | 'input' | 'mic' | 'send' | 'speaker' | 'like';
/** 目前要使用者點的東西：聊天畫面的按鈕，或面板裡的選項、停止錄音。 */
export type Spot = Target | 'choice' | 'stop';
export type IconName = 'mic' | 'doc' | 'search' | 'map' | 'shield';

export interface Option {
  id: string;
  label: string;
  /** 只有上傳面板的選項會用到 */
  image?: string;
  /** 橫式圖片要滿版，字才讀得到 */
  wide?: boolean;
}

interface BaseStep {
  id: string;
  /** 顯示在 spotlight 旁或面板裡的說明 */
  tip: string;
  /** 點錯時的提示，沒寫就用預設文字 */
  hint?: string;
}

/** AI 回答後留時間閱讀，不需要操作，時間到自動往下。 */
export interface ReadStep {
  id: string;
  type: 'read';
}

/** 必須點到指定按鈕才能繼續。 */
export interface TapStep extends BaseStep {
  type: 'tap';
  target: Target;
  /** 同時亮起最新的 AI 回覆，並標上這段說明 */
  resultTip?: string;
}

/** 上傳面板：選預設圖片，不讀取真實檔案。 */
export interface AttachStep extends BaseStep {
  type: 'attach';
  pick: string;
  options: Option[];
}

/**
 * 點選提問，填入輸入框。
 * options 給多個選項，label 要是完整的句子，就是實際會打進輸入框的內容；
 * text 則是 scenario.prompts 的鍵值範本，如 "{plan}"。
 */
export interface PromptStep extends BaseStep {
  type: 'prompt';
  pick?: string;
  options?: Option[];
  text?: string;
  /** 進入此步驟時替換選擇，用來示範換條件。 */
  flip?: { pick: string; map: Record<string, string> };
}

/** 點送出後顯示載入動畫，再顯示 scenario.replies[reply]。 */
export interface SendStep extends BaseStep {
  type: 'send';
  reply: string;
}

/** 模擬語音輸入：不使用麥克風，長者按停止鍵後文字才浮現。 */
export interface VoiceStep extends BaseStep {
  type: 'voice';
  phrase: string;
}

/** 點喇叭播放音檔。 */
export interface PlayStep extends BaseStep {
  type: 'play';
  audio: string;
}

export interface DoneStep {
  id: string;
  type: 'done';
  title: string;
  points: string[];
}

export type Step =
  | ReadStep
  | TapStep
  | AttachStep
  | PromptStep
  | SendStep
  | VoiceStep
  | PlayStep
  | DoneStep;

export interface PlaceCard {
  id: string;
  time: string;
  place: string;
  district: string;
  /** 1:1 的地點照片，來源見 public/images/places/CREDITS.md */
  image: string;
}

export interface Reply {
  headline?: string;
  body?: string[];
  cards?: PlaceCard[];
  /** 訊息下方顯示功能列（含喇叭） */
  actions?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  prompts?: Record<string, string>;
  replies: Record<string, Reply>;
  steps: Step[];
}

export type Picks = Record<string, string>;

export type ChatMessage =
  | { role: 'user'; text: string; image?: string }
  | { role: 'ai'; reply: Reply };
