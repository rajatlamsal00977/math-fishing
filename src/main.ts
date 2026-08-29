import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PondScene } from "./scenes/PondScene";
import { ReelingScene } from "./scenes/ReelingScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 960,
  height: 640,
  backgroundColor: "#3d6b7d",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [BootScene, PondScene, ReelingScene],
};

new Phaser.Game(config);
