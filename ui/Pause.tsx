type PauseProps = {
  onResume: () => void;
  onRestart: () => void;
};

export function Pause({ onResume, onRestart }: PauseProps) {
  return (
    <div className="overlayPanel">
      <p className="eyebrow">Pausa</p>
      <h1>Respira y segui</h1>
      <div className="overlayActions">
        <button type="button" onClick={onResume}>
          Seguir
        </button>
        <button type="button" className="secondaryButton" onClick={onRestart}>
          Reiniciar
        </button>
      </div>
    </div>
  );
}
