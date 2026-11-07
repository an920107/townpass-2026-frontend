interface Props {
  tip: string;
  phrase: string;
  listening: boolean;
  nudges: number;
}

/** 模擬收音畫面：波形只是動畫，手機沒有真的在聽。停止鍵在輸入列的麥克風位置。 */
export function VoicePanel({ tip, phrase, listening, nudges }: Props) {
  if (!listening) return null;
  return (
    <div className="voice-panel" data-spot="stop">
      <p key={nudges} className={nudges > 0 ? 'inline-tip is-hint' : 'inline-tip'} aria-live="polite">
        {tip}
      </p>
      <div key={`card-${nudges}`} className={`voice-card${nudges > 0 ? ' is-nudged-card' : ''}`}>
        <strong>「{phrase}」</strong>
      </div>
      <div className="wave" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />
        ))}
      </div>
    </div>
  );
}
