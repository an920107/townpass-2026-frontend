const BARS = 9;

/** 收音中的聲波動畫：只是動畫，手機沒有真的在聽。 */
export function Wave() {
  return (
    <span className="wave" aria-hidden="true">
      {Array.from({ length: BARS }, (_, i) => (
        <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />
      ))}
    </span>
  );
}
