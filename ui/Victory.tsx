type VictoryProps = {
  score: number;
  onRestart: () => void;
};

export function Victory({ score, onRestart }: VictoryProps) {
  return (
    <div className="overlayPanel">
      <p className="eyebrow">Level Complete</p>
      <h1>La 10 ya esta arriba</h1>
      <p>Puntos: {score}</p>
      <button type="button" onClick={onRestart}>
        Jugar de nuevo
      </button>
    </div>
  );
}
