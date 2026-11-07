import { useCallback, useEffect, useState } from 'react';
import { ScenarioPlayer } from './engine/ScenarioPlayer';
import { ScenarioMenu } from './modules/ScenarioMenu';
import { scenarios } from './scenarios';
import { loadCompleted, saveCompleted, clearCompleted } from './storage';

function currentId(): string | null {
  return (history.state as { scenario?: string } | null)?.scenario ?? null;
}

export function App() {
  const [openId, setOpenId] = useState(currentId);
  const [completed, setCompleted] = useState(loadCompleted);

  // 只有進入情境會新增一筆瀏覽紀錄，返回鍵會直接回到選單。
  useEffect(() => {
    const onPopState = () => setOpenId(currentId());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const open = (id: string) => {
    history.pushState({ scenario: id }, '');
    setOpenId(id);
  };

  const complete = useCallback((id: string) => {
    setCompleted((list) => {
      if (list.includes(id)) return list;
      const next = [...list, id];
      saveCompleted(next);
      return next;
    });
  }, []);

  // 除錯用：清掉紀錄後直接回到全新狀態。
  const reset = useCallback(() => {
    clearCompleted();
    setCompleted([]);
  }, []);

  const scenario = scenarios.find((s) => s.id === openId);

  if (!scenario) {
    return (
      <ScenarioMenu
        scenarios={scenarios}
        completed={completed}
        onOpen={open}
        onReset={reset}
      />
    );
  }
  return (
    <ScenarioPlayer
      key={scenario.id}
      scenario={scenario}
      onExit={() => history.back()}
      onComplete={complete}
    />
  );
}
