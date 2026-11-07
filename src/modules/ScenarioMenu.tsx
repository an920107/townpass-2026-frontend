import type { Scenario } from '../types';
import { Icon } from './Icons';

interface Props {
  scenarios: Scenario[];
  completed: string[];
  onOpen: (id: string) => void;
}

/** 情境總覽。五個情境可自由選擇，已完成的標上「完成」。 */
export function ScenarioMenu({ scenarios, completed, onOpen }: Props) {
  const done = scenarios.filter((scenario) => completed.includes(scenario.id)).length;

  return (
    <div className="screen">
      <main className="menu">
        <div className="menu-head">
          <h2 className="menu-title">選一個來練習</h2>
          <p className="menu-progress">已完成 {done} 個</p>
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
