type GameOverProps = {
  onRestart: () => void;
};

export function GameOver({ onRestart }: GameOverProps) {
  return (
    <div className="overlayPanel">
      <p className="eyebrow">Game Over</p>
      <h1>Otra vez desde Rosario</h1>
      <button type="button" onClick={onRestart}>
        Reiniciar
      </button>
    </div>
  );
}
