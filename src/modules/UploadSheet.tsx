import type { Option } from '../types';

interface Props {
  tip: string;
  nudges: number;
  options: Option[];
  onPick: (option: Option) => void;
}

/** 模擬上傳面板：只列出預設圖片，不會開啟手機相簿。 */
export function UploadSheet({ tip, nudges, options, onPick }: Props) {
  return (
    <>
      <div className="sheet-scrim" />
      <div className="upload-sheet">
        <p key={nudges} className={nudges > 0 ? 'inline-tip is-hint' : 'inline-tip'} aria-live="polite">
          {tip}
        </p>
        <div className={`upload-grid${options.length === 1 && !options[0].wide ? ' count-1' : ''}`}>
          {options.map((option) => (
            <button key={option.id} data-target="choice" onClick={() => onPick(option)}>
              <img src={option.image} alt="" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
