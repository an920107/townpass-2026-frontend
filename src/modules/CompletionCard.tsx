import { Icon } from './Icons';

interface Props {
  title: string;
  points: string[];
  onReplay: () => void;
  onExit: () => void;
}

/** 完成時從聊天畫面底部升起，不離開 App 畫面。 */
export function CompletionCard({ title, points, onReplay, onExit }: Props) {
  return (
    <>
      <div className="sheet-scrim" />
      <div className="completion">
        <h2>{title}</h2>
        <ul>
          {points.map((point) => (
            <li key={point}>
              <Icon name="check" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="safety-note">AI 可能會出錯，重要的事要再確認。</p>
        <button className="big-button" onClick={onExit}>
          回選單
        </button>
        <button className="big-button outline" onClick={onReplay}>
          再體驗一次
        </button>
      </div>
    </>
  );
}
