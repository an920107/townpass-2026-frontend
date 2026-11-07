import { useEffect, useRef, type ReactNode } from 'react';
import type { ChatMessage, Reply, Spot, Target } from '../types';
import { Icon } from './Icons';
import { Wave } from './Wave';

interface Props {
  messages: ChatMessage[];
  waiting: boolean;
  draft: string;
  /** 使用者點過輸入框，準備輸入 */
  typing: boolean;
  /** 正在收音，麥克風變成停止鍵 */
  recording: boolean;
  attachment?: string;
  spot: Spot | null;
  /** 顯示在回覆功能列的說明 */
  toolTip?: string;
  resultTip?: string;
  speakerPlaying: boolean;
  nudges: number;
  /** 顯示在輸入框上方的面板 */
  children?: ReactNode;
}

/** 模擬 AI App 畫面。按鈕只標 data-target，由 ScenarioPlayer 判斷點對點錯。 */
export function ChatMock({
  messages,
  waiting,
  draft,
  typing,
  recording,
  attachment,
  spot,
  toolTip,
  resultTip,
  speakerPlaying,
  nudges,
  children,
}: Props) {
  const logRef = useRef<HTMLDivElement>(null);

  // 新訊息要從開頭讀起，所以捲到它的頂端，而不是最底部。
  useEffect(() => {
    const log = logRef.current;
    const last = log?.lastElementChild as HTMLElement | null;
    if (log && last) log.scrollTop = last.offsetTop;
  }, [messages.length, waiting, resultTip]);

  const composerButton = (name: Exclude<Target, 'input' | 'speaker' | 'like'>, label: string) => {
    const isSpot = spot === name;
    return (
      <button
        key={isSpot ? `${name}-${nudges}` : name}
        className={`round-button${isSpot ? ' is-target' : ''}${isSpot && nudges > 0 ? ' is-nudged' : ''}`}
        data-target={name}
        data-spot={name === 'send' ? undefined : name}
        aria-label={label}
      >
        <Icon name={name} />
      </button>
    );
  };

  return (
    <section className="chat-app" aria-label="模擬的 AI App">
      <div className={`chat-log${resultTip ? ' has-result-tip' : ''}`} ref={logRef}>
        {messages.length === 0 && !waiting && <p className="chat-empty">您好！有什麼想問的嗎？</p>}
        {messages.map((message, i) =>
          message.role === 'user' ? (
            <div key={i} className="bubble user">
              {message.image && <img src={message.image} alt="您選的圖片" />}
              <p>{message.text}</p>
            </div>
          ) : (
            <AiBubble
              key={i}
              reply={message.reply}
              spot={spot}
              tip={toolTip}
              isLast={i === messages.length - 1}
              resultTip={i === messages.length - 1 ? resultTip : undefined}
              nudges={nudges}
              speakerPlaying={speakerPlaying}
            />
          ),
        )}
        {waiting && (
          <div className="bubble ai typing" aria-label="AI 正在回答">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      {children}

      {/* 送出時連附件和輸入框一起亮起來，才看得到要送出的內容。 */}
      <div
        className="composer-area"
        data-spot={spot === 'send' || spot === 'stop' ? spot : undefined}
      >
        {attachment && (
          <div className="attachment">
            <img src={attachment} alt="準備送出的圖片" />
          </div>
        )}
        <div className="composer">
          {composerButton('plus', '上傳圖片')}
          <button
            key={spot === 'input' ? `input-${nudges}` : 'input'}
            className={`composer-input${draft ? '' : ' is-empty'}${typing ? ' is-typing' : ''}${recording ? ' is-recording' : ''}${spot === 'input' ? ' is-target' : ''}${spot === 'input' && nudges > 0 ? ' is-nudged' : ''}`}
            data-target="input"
            data-spot="input"
            aria-label={recording ? '正在錄音' : '輸入框'}
          >
            {recording ? <Wave /> : draft || (typing ? '' : '問問 AI')}
          </button>
          {recording ? (
            <button
              key={`stop-${nudges}`}
              className={`round-button is-recording${spot === 'stop' ? ' is-target' : ''}${spot === 'stop' && nudges > 0 ? ' is-nudged' : ''}`}
              data-target="stop"
              aria-label="停止錄音"
            >
              <Icon name="stop" />
            </button>
          ) : (
            composerButton('mic', '麥克風')
          )}
          {composerButton('send', '送出')}
        </div>
      </div>
    </section>
  );
}

function AiBubble({
  reply,
  spot,
  tip,
  isLast,
  resultTip,
  nudges,
  speakerPlaying,
}: {
  reply: Reply;
  spot: Spot | null;
  tip?: string;
  isLast: boolean;
  resultTip?: string;
  nudges: number;
  speakerPlaying: boolean;
}) {
  const isSpot = spot === 'speaker';
  const likeSpot = isLast && spot === 'like';
  return (
    <div className="bubble ai" data-spot={resultTip ? 'result' : undefined}>
      {resultTip && <p className="result-tip">{resultTip}</p>}
      {reply.headline && <p className="reply-headline">{reply.headline}</p>}
      {reply.body?.map((line) => <p key={line}>{line}</p>)}
      {reply.cards?.map((card) => (
        <div key={card.id} className="place-card">
          <img className="place-art" src={card.image} alt={card.place} />
          <div>
            <span>{card.time}</span>
            <strong>{card.place}</strong>
            <span>{card.district}</span>
          </div>
        </div>
      ))}
      {(reply.actions || likeSpot) && (
        <div className="reply-tools" data-spot={likeSpot ? 'like' : 'speaker'}>
          <div className="reply-actions">
            <button
              key={isSpot ? nudges : 'idle'}
              className={`round-button${isSpot ? ' is-target' : ''}${isSpot && nudges > 0 ? ' is-nudged' : ''}${speakerPlaying ? ' is-playing' : ''}`}
              data-target="speaker"
              aria-label="朗讀回答"
            >
              <Icon name="speaker" />
            </button>
            <span className="reply-action-icon">
              <Icon name="copy" />
            </span>
            {likeSpot ? (
              <button
                key={nudges}
                className={`round-button is-target${nudges > 0 ? ' is-nudged' : ''}`}
                data-target="like"
                aria-label="按讚"
              >
                <Icon name="like" />
              </button>
            ) : (
              <span className="reply-action-icon">
                <Icon name="like" />
              </span>
            )}
          </div>
          {tip && isLast && (
            <p key={nudges} className={nudges > 0 ? 'inline-tip is-hint' : 'inline-tip'} aria-live="polite">
              {tip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
