"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { levels } from "@/data/levels";
import { Game } from "@/game/Game";
import type { InputManager } from "@/game/Input";
import type { GameSnapshot } from "@/game/types";
import { GameOver } from "@/ui/GameOver";
import { HUD } from "@/ui/HUD";
import { Pause } from "@/ui/Pause";
import { TouchControls } from "@/ui/TouchControls";
import { Victory } from "@/ui/Victory";
import "./styles.css";

const initialSnapshot: GameSnapshot = {
  status: "menu",
  lives: 3,
  score: 0,
  highScore: 0,
  message: "",
  level: 1,
  levelName: "Rosario / Origen",
  canClimb: false,
};

export default function DonkeyMessiPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [inputManager, setInputManager] = useState<InputManager | null>(null);
  const [showTraining, setShowTraining] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const game = new Game(canvas, levels[0], setSnapshot);
    gameRef.current = game;
    setInputManager(game.input);
    game.startLoop();

    const handleResize = () => game.resize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      game.stopLoop();
      gameRef.current = null;
      setInputManager(null);
    };
  }, []);

  const startGame = () => gameRef.current?.play();
  const restartGame = () => gameRef.current?.restart();
  const showMenu = () => {
    gameRef.current?.menu();
    setShowTraining(false);
  };
  const pauseGame = () => gameRef.current?.pause();
  const resumeGame = () => gameRef.current?.resume();
  const isPlaying = snapshot.status === "playing";

  return (
    <main className="gameShell">
      <section className="phoneStage" aria-label="Donkey Kong Edicion Messi">
        <canvas ref={canvasRef} className="gameCanvas" width={390} height={720} />
        <HUD snapshot={snapshot} />
        {(snapshot.status === "playing" || snapshot.status === "paused") && (
          <button className="pauseButton" type="button" aria-label="Pausa" onClick={pauseGame}>
            II
          </button>
        )}

        {snapshot.status === "menu" && (
          <>
            <Image className="coverArt" src="/assets/cover-v24-worldcup.png" alt="" fill sizes="430px" priority />
            <div className="coverShade" />
            {!showTraining ? (
              <div className="menuPanel">
                <p className="eyebrow">Mobile v2.4</p>
                <h1>Donkey Kong: Edicion Messi</h1>
                <p>{snapshot.levelName}</p>
                <div className="overlayActions">
                  <button type="button" onClick={startGame}>
                    Jugar
                  </button>
                  <button type="button" className="secondaryButton" onClick={() => setShowTraining(true)}>
                    Entrenar
                  </button>
                </div>
              </div>
            ) : (
              <div className="menuPanel trainingPanel">
                <p className="eyebrow">Entrenamiento</p>
                <h1>Subi, esquiva, llega</h1>
                <div className="trainingGrid" aria-label="Controles">
                  <span>&lt; &gt;</span>
                  <span>Mover</span>
                  <span>J</span>
                  <span>Saltar</span>
                  <span>^ v</span>
                  <span>Escaleras</span>
                </div>
                <div className="overlayActions">
                  <button type="button" onClick={startGame}>
                    Jugar
                  </button>
                  <button type="button" className="secondaryButton" onClick={() => setShowTraining(false)}>
                    Volver
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {snapshot.status === "gameOver" && <GameOver score={snapshot.score} onRestart={restartGame} onMenu={showMenu} />}
        {snapshot.status === "paused" && <Pause onResume={resumeGame} onRestart={restartGame} onMenu={showMenu} />}
        {snapshot.status === "levelComplete" && (
          <Victory score={snapshot.score} onRestart={restartGame} onMenu={showMenu} />
        )}

        <TouchControls input={inputManager} canClimb={snapshot.canClimb} disabled={!isPlaying} />
      </section>
    </main>
  );
}
