import { useEffect, useRef } from 'react';
import type { Scenario } from '../types';
import { Icon } from './Icons';

/** 連續點「已完成 x 個」這麼多下，就清掉完成紀錄。 */
const RESET_TAPS = 5;
/** 停頓超過這個時間就重新數，避免誤觸。 */
const TAP_WINDOW_MS = 1500;

interface Props {
  scenarios: Scenario[];
  completed: string[];
  onOpen: (id: string) => void;
  /** 除錯用：清掉完成紀錄 */
  onReset: () => void;
}

/** 情境總覽。五個情境可自由選擇，已完成的標上「完成」。 */
export function ScenarioMenu({ scenarios, completed, onOpen, onReset }: Props) {
  const done = scenarios.filter((scenario) => completed.includes(scenario.id)).length;
  const taps = useRef(0);
  const timer = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  // 除錯手勢：連續點右上角的「已完成 x 個」5 下，就把完成紀錄清掉。
  const countTap = () => {
    taps.current += 1;
    window.clearTimeout(timer.current);
    if (taps.current >= RESET_TAPS) {
      taps.current = 0;
      onReset();
      return;
    }
    timer.current = window.setTimeout(() => {
      taps.current = 0;
    }, TAP_WINDOW_MS);
  };

  return (
    <div className="screen">
      <main className="menu">
        <div className="menu-head">
          <h2 className="menu-title">選一個來練習</h2>
          <p className="menu-progress" onClick={countTap}>
            已完成 {done} 個
          </p>
        </div>
        <ol className="menu-list">
          {scenarios.map((scenario) => (
            <li key={scenario.id}>
              <button className="menu-row" onClick={() => onOpen(scenario.id)}>
                <span className="menu-icon">
                  <Icon name={scenario.icon} />
                </span>
                <span className="menu-text">
                  <span className="menu-name">{scenario.title}</span>
                  <span className="menu-subtitle">{scenario.subtitle}</span>
                </span>
                <span className="menu-go">
                  {completed.includes(scenario.id) && <span className="menu-state">完成</span>}
                  <Icon name="go" />
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="menu-note">這些操作都在 App 裡模擬：不會真的錄音，也不會開啟你的相簿。</p>
      </main>
    </div>
  );
}
