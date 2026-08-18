type GameOverProps = {
  onRestart: () => void;
  onMenu: () => void;
  score: number;
};

export function GameOver({ onRestart, onMenu, score }: GameOverProps) {
  return (
    <div className="overlayPanel">
      <p className="eyebrow">Game Over</p>
      <h1>Otra vez desde Rosario</h1>
      <p>Puntos: {score}</p>
      <div className="overlayActions">
        <button type="button" onClick={onRestart}>
          Reiniciar
        </button>
        <button type="button" className="secondaryButton" onClick={onMenu}>
          Inicio
        </button>
      </div>
    </div>
  );
}
