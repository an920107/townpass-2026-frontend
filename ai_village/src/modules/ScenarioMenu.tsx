import type { Scenario } from '../types';
import { Icon } from './Icons';

interface Props {
  scenarios: Scenario[];
  completed: string[];
  onOpen: (id: string) => void;
}

/** 情境總覽。五個情境可自由選擇，已完成的會打勾。 */
export function ScenarioMenu({ scenarios, completed, onOpen }: Props) {
  return (
    <main className="menu">
      <ol className="menu-list">
        {scenarios.map((scenario) => (
          <li key={scenario.id}>
            <button className="menu-card" onClick={() => onOpen(scenario.id)}>
              <span className="menu-icon">
                <Icon name={scenario.icon} />
              </span>
              <strong>{scenario.title}</strong>
              <span className="menu-subtitle">{scenario.subtitle}</span>
              {completed.includes(scenario.id) && (
                <span className="menu-done" aria-label="已完成">
                  <Icon name="check" />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </main>
  );
}
