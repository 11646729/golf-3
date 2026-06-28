import Phaser from "phaser"

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" })
  }

  create() {
    const { width, height } = this.scale

    // Starfield background
    this._createStars()

    // Title
    this.add
      .text(width / 2, height * 0.25, "SPACE INVADERS", {
        font: "bold 42px monospace",
        fill: "#00ff88",
      })
      .setOrigin(0.5)

    // Animated sample enemies
    const colors = [0xff00ff, 0xff00ff, 0x00ffff, 0x00ffff, 0xffff00]
    const cols = 8
    const startX = width / 2 - (cols / 2) * 50 + 25
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < cols; col++) {
        this.add.rectangle(startX + col * 50, height * 0.42 + row * 36, 20, 12, colors[row])
      }
    }

    // Blinking "press space" text
    const prompt = this.add
      .text(width / 2, height * 0.72, "PRESS SPACE TO START", {
        font: "22px monospace",
        fill: "#ffffff",
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: prompt,
      alpha: 0,
      duration: 600,
      ease: "Linear",
      yoyo: true,
      repeat: -1,
    })

    // Controls hint
    this.add
      .text(width / 2, height * 0.85, "← → or A D to move   SPACE to fire", {
        font: "14px monospace",
        fill: "#888888",
      })
      .setOrigin(0.5)

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("GameScene", { score: 0, wave: 1 })
    })
  }

  _createStars() {
    const { width, height } = this.scale
    const gfx = this.add.graphics()
    gfx.fillStyle(0xffffff, 1)
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const size = Math.random() < 0.2 ? 2 : 1
      gfx.fillRect(x, y, size, size)
    }
  }
}
