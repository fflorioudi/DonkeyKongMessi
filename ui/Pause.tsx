import Image from "next/image";

type PauseProps = {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
};

export function Pause({ onResume, onRestart, onMenu }: PauseProps) {
  return (
    <div className="imageOverlay pauseOverlay" role="dialog" aria-label="Pausa">
      <Image src="/assets/ui/cartel-pausa.png" alt="" fill sizes="390px" priority />
      <button className="imageHotspot pauseResume" type="button" onClick={onResume}>
        <span className="srOnly">Seguir</span>
      </button>
      <button className="imageHotspot pauseRestart" type="button" onClick={onRestart}>
        <span className="srOnly">Reiniciar</span>
      </button>
      <button className="imageHotspot pauseHome" type="button" onClick={onMenu}>
        <span className="srOnly">Inicio</span>
      </button>
    </div>
  );
}
