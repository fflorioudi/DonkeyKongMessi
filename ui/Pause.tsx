type PauseProps = {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
};

export function Pause({ onResume, onRestart, onMenu }: PauseProps) {
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
        <button type="button" className="secondaryButton" onClick={onMenu}>
          Inicio
        </button>
      </div>
    </div>
  );
}
