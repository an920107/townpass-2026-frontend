import type { Option } from '../types';

interface Props {
  tip: string;
  nudges: number;
  options: Option[];
  onPick: (option: Option) => void;
}

/** 免打字的預設問句：點了會填入輸入框。 */
export function ChoicePanel({ tip, nudges, options, onPick }: Props) {
  return (
    <div className="choice-panel" data-spot="choice">
      <p key={nudges} className={nudges > 0 ? 'inline-tip is-hint' : 'inline-tip'} aria-live="polite">
        {tip}
      </p>
      {options.map((option) => (
        <button
          key={option.id}
          className="choice-button"
          data-target="choice"
          onClick={() => onPick(option)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
