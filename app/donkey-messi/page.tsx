"use client";

import { useEffect, useRef, useState } from "react";
import { levels } from "@/data/levels";
import { Game } from "@/game/Game";
import type { InputManager } from "@/game/Input";
import type { GameSnapshot } from "@/game/types";
import { GameOver } from "@/ui/GameOver";
import { HUD } from "@/ui/HUD";
import { TouchControls } from "@/ui/TouchControls";
import { Victory } from "@/ui/Victory";
import "./styles.css";

const initialSnapshot: GameSnapshot = {
  status: "menu",
  lives: 3,
  score: 0,
  highScore: 0,
  level: 1,
  levelName: "Rosario / Origen",
  canClimb: false,
};

export default function DonkeyMessiPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [inputManager, setInputManager] = useState<InputManager | null>(null);

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
  const isPlaying = snapshot.status === "playing";

  return (
    <main className="gameShell">
      <section className="phoneStage" aria-label="Donkey Kong Edicion Messi">
        <canvas ref={canvasRef} className="gameCanvas" width={390} height={720} />
        <HUD snapshot={snapshot} />

        {snapshot.status === "menu" && (
          <div className="overlayPanel">
            <p className="eyebrow">Mobile v1</p>
            <h1>Donkey Kong: Edicion Messi</h1>
            <p>{snapshot.levelName}</p>
            <button type="button" onClick={startGame}>
              Jugar
            </button>
          </div>
        )}

        {snapshot.status === "gameOver" && <GameOver onRestart={restartGame} />}
        {snapshot.status === "levelComplete" && <Victory score={snapshot.score} onRestart={restartGame} />}

        <TouchControls input={inputManager} canClimb={snapshot.canClimb} disabled={!isPlaying} />
      </section>
    </main>
  );
}
