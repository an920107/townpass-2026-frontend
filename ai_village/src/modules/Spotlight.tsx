import { useEffect, useState } from 'react';
import type { Spot } from '../types';

const PADDING = 6;
const RADIUS = 16;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Mask {
  /** 亮起的區域，可以互相重疊 */
  holes: Rect[];
  /** 主要區域的上緣，提示框放在它上方 */
  top: number;
  /** 提示框箭頭的水平位置 */
  arrow: number;
}

function padded(rect: DOMRect): Rect {
  return {
    x: rect.left - PADDING,
    y: rect.top - PADDING,
    w: rect.width + PADDING * 2,
    h: rect.height + PADDING * 2,
  };
}

/** AI 的回覆可能比聊天區高，亮起的範圍不能超出聊天區。 */
function resultRect(): Rect | null {
  const result = document.querySelector('[data-spot="result"]');
  const log = document.querySelector('.chat-log');
  if (!result || !log) return null;
  const r = padded(result.getBoundingClientRect());
  const { top, bottom } = log.getBoundingClientRect();
  const y = Math.max(r.y, top);
  const h = Math.min(r.y + r.h, bottom) - y;
  return h > 0 ? { ...r, y, h } : null;
}

interface Props {
  spot: Spot | null;
  tip: string;
  nudges: number;
  /** 同時亮起最新的 AI 回覆 */
  showResult: boolean;
}

/** 畫面其他地方變暗，只留下要看和要點的位置。面板和喇叭的說明已經在畫面裡，其他才顯示提示框。 */
export function Spotlight({ spot, tip, nudges, showResult }: Props) {
  const showTip = spot === 'plus' || spot === 'input' || spot === 'mic' || spot === 'send';
  const [mask, setMask] = useState<Mask | null>(null);

  // 按鈕會隨聊天內容和捲動移動，所以每一幀都重新量。
  useEffect(() => {
    if (!spot) {
      setMask(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      const areas = [...document.querySelectorAll(`[data-spot="${spot}"]`)];
      const button = document.querySelector(`[data-target="${spot}"]`);
      if (areas.length === 0 || !button) {
        // 上傳面板有自己的遮罩，不用 spotlight。
        setMask(null);
      } else {
        const mains = areas.map((area) => padded(area.getBoundingClientRect()));
        const main = mains[mains.length - 1];
        const result = showResult ? resultRect() : null;
        const { left, width } = button.getBoundingClientRect();
        const next = {
          holes: result ? [...mains, result] : mains,
          top: main.y,
          arrow: left + width / 2,
        };
        setMask((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      }
      frame = requestAnimationFrame(measure);
    };
    measure();
    return () => cancelAnimationFrame(frame);
  }, [spot, showResult]);

  if (!spot || !mask) return null;

  return (
    <>
      {/* 用 mask 挖洞：區域重疊時仍然是亮的，不會變回暗的。 */}
      <svg className="spot-hole" aria-hidden="true">
        <defs>
          <mask id="spot-mask">
            <rect width="100%" height="100%" fill="white" />
            {mask.holes.map(({ x, y, w, h }, i) => (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={Math.min(RADIUS, w / 2, h / 2)}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="currentColor" mask="url(#spot-mask)" />
      </svg>
      {showTip && (
        <div className="spot-tip-anchor" style={{ bottom: window.innerHeight - mask.top + 8 }}>
          <p key={nudges} className={nudges > 0 ? 'spot-tip is-hint' : 'spot-tip'} aria-live="polite">
            {tip}
            <i className="spot-arrow" style={{ left: mask.arrow - 16 }} />
          </p>
        </div>
      )}
    </>
  );
}
