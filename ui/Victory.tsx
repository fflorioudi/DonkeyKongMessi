type VictoryProps = {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
};

export function Victory({ score, onRestart, onMenu }: VictoryProps) {
  return (
    <div className="overlayPanel">
      <p className="eyebrow">Level Complete</p>
      <h1>La 10 ya esta arriba</h1>
      <p>Puntos: {score}</p>
      <div className="overlayActions">
        <button type="button" onClick={onRestart}>
          Jugar de nuevo
        </button>
        <button type="button" className="secondaryButton" onClick={onMenu}>
          Inicio
        </button>
      </div>
    </div>
  );
}
