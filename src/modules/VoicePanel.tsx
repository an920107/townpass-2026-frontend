interface Props {
  /** 使用者要照著唸的句子 */
  phrase: string;
}

/**
 * 錄音的稿子。收音動畫在輸入框裡，說明文字改用 spotlight 的對話框，
 * 跟其他步驟一致；這張卡只負責把要唸的話亮給使用者看。
 */
export function VoicePanel({ phrase }: Props) {
  return (
    <div className="voice-panel" data-spot="stop">
      <p className="voice-card">
        <strong>「{phrase}」</strong>
      </p>
    </div>
  );
}
