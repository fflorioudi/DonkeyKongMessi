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
  elapsedTime: 0,
  bestTime: 0,
  scoreBreakdown: {
    progress: 0,
    completion: 0,
    lives: 0,
    time: 0,
    total: 0,
  },
  isNewHighScore: false,
  isNewBestTime: false,
  message: "",
  audioEnabled: true,
  level: 1,
  levelIndex: 0,
  levelCount: levels.length,
  levelLabel: "Tutorial",
  levelName: "Rosario / Primer ascenso",
  levelTheme: "Prologo jugable: aprender a subir, esquivar y llegar a la Copa antes del Nivel 1.",
  activePowerUp: null,
  canClimb: false,
};

const campaignPath = [
  { step: "Tutorial", title: "Rosario / Primer ascenso", status: "Jugable" },
  { step: "Nivel 1", title: "Barcelona / Nace el 10", status: "Jugable" },
  { step: "Nivel 2", title: "Europa / Noches grandes", status: "Jugable" },
  { step: "Nivel 3", title: "Seleccion / Peso de la camiseta", status: "Bloqueado" },
  { step: "Nivel 4", title: "Semifinal / Todo o nada", status: "Bloqueado" },
  { step: "Nivel 5", title: "Final / La Copa vuelve", status: "Bloqueado" },
];

const levelSelectSlots = [
  {
    label: "Tutorial",
    title: "Rosario / Primer ascenso",
    detail: "Base para aprender saltos, escaleras y Botin.",
    status: "Listo",
    levelIndex: 0,
    unlocked: true,
    cover: "/assets/levels/level-0-cover.png",
  },
  {
    label: "Nivel 1",
    title: "Barcelona / Nace el 10",
    detail: "Camp Nou, mas recorrido y obstaculos mas seguidos.",
    status: "Nuevo",
    levelIndex: 1,
    unlocked: true,
    cover: "/assets/levels/level-1-cover.png",
  },
  {
    label: "Nivel 2",
    title: "Europa / Noches grandes",
    detail: "Estadio europeo, pinches, escudo y Neymar.",
    status: "Nuevo",
    levelIndex: 2,
    unlocked: true,
    cover: "/assets/levels/level-2-cover.png",
  },
  { label: "Nivel 3", title: "Seleccion / Peso de la camiseta", detail: "Cover pendiente.", status: "Bloqueado", unlocked: false },
  { label: "Nivel 4", title: "Semifinal / Todo o nada", detail: "Cover pendiente.", status: "Bloqueado", unlocked: false },
  { label: "Nivel 5", title: "Final / La Copa vuelve", detail: "Cover pendiente.", status: "Bloqueado", unlocked: false },
];

export default function DonkeyMessiPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [inputManager, setInputManager] = useState<InputManager | null>(null);
  const [showTraining, setShowTraining] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const game = new Game(canvas, levels, setSnapshot);
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

  const playLevel = (index: number) => {
    const game = gameRef.current;

    if (!game) {
      return;
    }

    game.selectLevel(index);
    setShowTraining(false);
    setShowLevelSelect(false);
    void game.audio.unlock().then(() => game.play());
  };
  const restartGame = () => gameRef.current?.restart();
  const playNextLevel = () => {
    const nextIndex = snapshot.levelIndex + 1;

    if (nextIndex >= levels.length) {
      return;
    }

    playLevel(nextIndex);
  };
  const showMenu = () => {
    gameRef.current?.menu();
    setShowTraining(false);
    setShowLevelSelect(false);
  };
  const pauseGame = () => gameRef.current?.pause();
  const resumeGame = () => gameRef.current?.resume();
  const toggleAudio = () => {
    gameRef.current?.audio.toggle();
    setSnapshot((current) => ({
      ...current,
      audioEnabled: gameRef.current?.audio.enabled ?? current.audioEnabled,
    }));
  };
  const testAudio = () => {
    gameRef.current?.audio.setEnabled(true);
    void gameRef.current?.audio.unlock().then(() => gameRef.current?.audio.playTest());
    setSnapshot((current) => ({
      ...current,
      audioEnabled: true,
    }));
  };
  const openLevelSelect = () => {
    setShowTraining(false);
    setShowLevelSelect(true);
  };
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
        {snapshot.status !== "menu" && (
          <button
            className={`soundButton ${snapshot.audioEnabled ? "isOn" : ""}`}
            type="button"
            aria-label={snapshot.audioEnabled ? "Silenciar sonido" : "Activar sonido"}
            onClick={toggleAudio}
          >
            {snapshot.audioEnabled ? "S" : "M"}
          </button>
        )}

        {snapshot.status === "menu" && (
          <>
            <Image
              className="coverArt coverArtTitleScreen"
              src="/assets/cover-chatgpt-escalada-del-10.png"
              alt=""
              fill
              sizes="430px"
              priority
            />
            <div className={`coverShade ${showTraining || showLevelSelect ? "isTraining" : "isTitle"}`} />
            {!showTraining && !showLevelSelect ? (
              <div className="coverHotspots" aria-label="Menu principal">
                <p className="buildStamp">Mobile v3.4.6</p>
                <button className="coverHotspot coverHotspotPlay" type="button" onClick={openLevelSelect}>
                  <span className="srOnly">Seleccionar nivel</span>
                </button>
                <button
                  className="coverHotspot coverHotspotTraining"
                  type="button"
                  onClick={() => {
                    setShowLevelSelect(false);
                    setShowTraining(true);
                  }}
                >
                  <span className="srOnly">Entrenar y ver camino de historia</span>
                </button>
                <button className="coverHotspot coverHotspotAudio" type="button" onClick={testAudio}>
                  <span className="srOnly">Probar audio</span>
                </button>
              </div>
            ) : showLevelSelect ? (
              <div className="menuPanel trainingPanel levelSelectPanel">
                <p className="eyebrow">Seleccion de niveles</p>
                <h1>Elegir escalada</h1>
                <div className="levelCardGrid" aria-label="Seleccion de nivel">
                  {levelSelectSlots.map((slot) => (
                    <button
                      key={slot.label}
                      className={`levelCard ${slot.unlocked ? "isUnlocked" : "isLocked"}`}
                      type="button"
                      disabled={!slot.unlocked}
                      onClick={() => slot.levelIndex !== undefined && playLevel(slot.levelIndex)}
                    >
                      <span className="levelCardCover" style={slot.cover ? { backgroundImage: `url(${slot.cover})` } : undefined} />
                      <span className="levelCardText">
                        <span>{slot.label}</span>
                        <strong>{slot.title}</strong>
                        <em>{slot.detail}</em>
                      </span>
                      <span className="levelCardStatus">{slot.status}</span>
                    </button>
                  ))}
                </div>
                <div className="overlayActions">
                  <button type="button" className="secondaryButton" onClick={() => setShowLevelSelect(false)}>
                    Volver
                  </button>
                  <button type="button" className="secondaryButton compactButton" onClick={testAudio}>
                    Audio
                  </button>
                </div>
              </div>
            ) : (
              <div className="menuPanel trainingPanel storyPanel">
                <p className="eyebrow">Prologo tutorial</p>
                <h1>Rosario antes del Nivel 1</h1>
                <p className="levelTheme">{snapshot.levelTheme}</p>
                <ol className="campaignPath" aria-label="Camino de historia">
                  {campaignPath.map((chapter) => (
                    <li key={chapter.step}>
                      <span>{chapter.step}</span>
                      <strong>{chapter.title}</strong>
                      <em>{chapter.status}</em>
                    </li>
                  ))}
                </ol>
                <div className="trainingGrid" aria-label="Controles">
                  <span>&lt; &gt;</span>
                  <span>Mover</span>
                  <span>J</span>
                  <span>Saltar</span>
                  <span>^ v</span>
                  <span>Escaleras</span>
                </div>
                <div className="overlayActions">
                  <button type="button" onClick={() => playLevel(0)}>
                    Tutorial
                  </button>
                  <button type="button" className="secondaryButton" onClick={openLevelSelect}>
                    Niveles
                  </button>
                  <button type="button" className="secondaryButton" onClick={() => setShowTraining(false)}>
                    Volver
                  </button>
                  <button type="button" className="secondaryButton compactButton" onClick={testAudio}>
                    Audio
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {snapshot.status === "gameOver" && <GameOver snapshot={snapshot} onRestart={restartGame} onMenu={showMenu} />}
        {snapshot.status === "paused" && <Pause onResume={resumeGame} onRestart={restartGame} onMenu={showMenu} />}
        {snapshot.status === "levelComplete" && (
          <Victory
            snapshot={snapshot}
            onRestart={restartGame}
            onMenu={showMenu}
            onNextLevel={playNextLevel}
            canNextLevel={snapshot.levelIndex + 1 < levels.length}
          />
        )}

        {isPlaying && <TouchControls input={inputManager} canClimb={snapshot.canClimb} disabled={false} />}
      </section>
    </main>
  );
}
