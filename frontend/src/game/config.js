import Phaser from "phaser"
import BootScene from "./scenes/BootScene"
import MenuScene from "./scenes/MenuScene"
import GameScene from "./scenes/GameScene"
import GameOverScene from "./scenes/GameOverScene"

export const getPhaserConfig = (parent) => ({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
})
