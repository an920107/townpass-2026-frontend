import { useEffect, useRef } from 'react';
import type { Spot } from '../types';

const PADDING = 6;
const RADIUS = 10;
/** 位置每幀往目標靠近的時間常數（毫秒）：越小越跟手，越大越滑。 */
const TAU = 70;
/** 兩個主區域（例如錄音的稿子加輸入列）再加上最新的 AI 回覆。 */
const MAX_HOLES = 3;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Mask {
  /** 亮起的區域 */
  holes: Rect[];
  /** 提示框箭頭要對準的水平位置 */
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

/** 量出這一幀應該亮起來的位置；沒有要亮的地方就回傳 null。 */
function measure(spot: Spot, showResult: boolean): Mask | null {
  const areas = [...document.querySelectorAll(`[data-spot="${spot}"]`)];
  const button = document.querySelector(`[data-target="${spot}"]`);
  // 上傳面板有自己的遮罩，不用 spotlight。
  if (areas.length === 0 || !button) return null;
  const mains = areas.map((area) => padded(area.getBoundingClientRect()));
  const result = showResult ? resultRect() : null;
  const { left, width } = button.getBoundingClientRect();
  return {
    holes: result ? [...mains, result] : mains,
    arrow: left + width / 2,
  };
}

function lerp(from: Rect, to: Rect, k: number): Rect {
  return {
    x: from.x + (to.x - from.x) * k,
    y: from.y + (to.y - from.y) * k,
    w: from.w + (to.w - from.w) * k,
    h: from.h + (to.h - from.h) * k,
  };
}

/** 光點的位置與亮度：亮度用遮罩的 opacity，收起來時是原地淡掉，不是縮小。 */
interface Slot {
  rect: Rect | null;
  alpha: number;
}

function paint(el: SVGRectElement | null, slot: Slot): void {
  if (!el) return;
  el.setAttribute('opacity', slot.alpha < 0.01 ? '0' : String(slot.alpha));
  if (!slot.rect || slot.alpha < 0.01) return;
  el.setAttribute('x', String(slot.rect.x));
  el.setAttribute('y', String(slot.rect.y));
  el.setAttribute('width', String(slot.rect.w));
  el.setAttribute('height', String(slot.rect.h));
}

interface Props {
  spot: Spot | null;
  tip: string;
  nudges: number;
  /** 同時亮起最新的 AI 回覆 */
  showResult: boolean;
}

/**
 * 畫面其他地方變暗，只留下要看和要點的位置。面板和喇叭的說明已經在畫面裡，其他才顯示提示框。
 *
 * 光點不是一格一格跳過去：位置由這個迴圈每幀往新目標收斂，
 * 換步驟時光點是滑過去的，遮罩也不會中間閃一下。
 */
export function Spotlight({ spot, tip, nudges, showResult }: Props) {
  const showTip =
    spot === 'plus' || spot === 'input' || spot === 'mic' || spot === 'send' || spot === 'stop';
  const veilRef = useRef<SVGRectElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLElement>(null);
  const holeRefs = useRef<(SVGRectElement | null)[]>([]);
  /** 目前畫面上的位置，跨步驟保留，下一步才能從上一個光點滑過去。 */
  const slots = useRef<Slot[]>(Array.from({ length: MAX_HOLES }, () => ({ rect: null, alpha: 0 })));
  const veil = useRef(0);
  const state = useRef({ spot, showResult });
  state.current = { spot, showResult };

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const k = reduce.matches ? 1 : 1 - Math.exp(-dt / TAU);
      const mask = state.current.spot ? measure(state.current.spot, state.current.showResult) : null;
      const targets = mask?.holes ?? [];

      for (let i = 0; i < MAX_HOLES; i += 1) {
        const own = targets[i];
        const slot = slots.current[i];
        if (own) {
          // 出現：位置滑過去，同時把光點亮起來。
          slot.rect = slot.rect ? lerp(slot.rect, own, k) : own;
        }
        // 消失：位置留著、原地淡掉，不會有一塊白在畫面中間收小。
        slot.alpha += ((own ? 1 : 0) - slot.alpha) * k;
        if (Math.abs(slot.alpha - (own ? 1 : 0)) < 0.01) slot.alpha = own ? 1 : 0;
        paint(holeRefs.current[i], slot);
      }

      // 遮罩淡出而不是直接抽掉，步驟之間的轉場才連續。
      const target = mask ? 1 : 0;
      veil.current += (target - veil.current) * k;
      if (Math.abs(veil.current - target) < 0.01) veil.current = target;
      if (veilRef.current) {
        veilRef.current.style.opacity = String(veil.current);
        veilRef.current.style.visibility = veil.current > 0 ? 'visible' : 'hidden';
      }

      // 提示框貼在亮起區域上方，箭頭永遠對準按鈕。
      const hole = slots.current[0].rect;
      if (hole && anchorRef.current) {
        anchorRef.current.style.bottom = `${Math.round(window.innerHeight - hole.y + 8)}px`;
      }
      const box = arrowRef.current?.parentElement;
      if (box) {
        const boxRect = box.getBoundingClientRect();
        const x = (mask?.arrow ?? boxRect.left + boxRect.width / 2) - boxRect.left;
        arrowRef.current!.style.left = `${Math.round(Math.min(Math.max(x, 14), boxRect.width - 14))}px`;
      }

      // 沒有要亮的地方、遮罩也收完了，就停下來不要一直重複量。
      if (!state.current.spot && veil.current === 0) return;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [spot, showResult]);

  const first = slots.current[0].rect;
  const bottom = first ? window.innerHeight - first.y + 8 : -999;

  return (
    <>
      {/* 用 mask 挖洞：區域重疊時仍然是亮的，不會變回暗的。 */}
      <svg className="spot-hole" aria-hidden="true">
        <defs>
          <mask id="spot-mask">
            <rect width="100%" height="100%" fill="#fff" />
            {Array.from({ length: MAX_HOLES }, (_, i) => (
              <rect
                key={i}
                ref={(el) => {
                  holeRefs.current[i] = el;
                }}
                rx={RADIUS}
                fill="#000"
                opacity="0"
              />
            ))}
          </mask>
        </defs>
        <rect
          ref={veilRef}
          width="100%"
          height="100%"
          fill="currentColor"
          mask="url(#spot-mask)"
          style={{ opacity: 0, visibility: 'hidden' }}
        />
      </svg>
      {showTip && (
        <div className="spot-tip-anchor" ref={anchorRef} style={{ bottom }}>
          <p key={nudges} className={nudges > 0 ? 'spot-tip is-hint' : 'spot-tip'} aria-live="polite">
            {tip}
            <i className="spot-arrow" ref={arrowRef} />
          </p>
        </div>
      )}
    </>
  );
}

