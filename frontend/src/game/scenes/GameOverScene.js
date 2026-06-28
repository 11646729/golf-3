import Phaser from "phaser"

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" })
  }

  create() {
    const { width, height } = this.scale
    const data = this.scene.settings.data || {}
    const score = data.score ?? 0
    const wave = data.wave ?? 1
    const victory = data.victory ?? false

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000)

    // Headline
    const headline = victory ? "WAVE COMPLETE!" : "GAME OVER"
    const color = victory ? "#00ff88" : "#ff4444"
    this.add
      .text(width / 2, height * 0.28, headline, {
        font: "bold 48px monospace",
        fill: color,
      })
      .setOrigin(0.5)

    // Stats
    this.add
      .text(width / 2, height * 0.44, `SCORE: ${score}`, {
        font: "28px monospace",
        fill: "#ffffff",
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height * 0.54, `WAVE: ${wave}`, {
        font: "22px monospace",
        fill: "#aaaaaa",
      })
      .setOrigin(0.5)

    if (victory) {
      this.add
        .text(width / 2, height * 0.64, `Next: Wave ${wave + 1} incoming...`, {
          font: "18px monospace",
          fill: "#888888",
        })
        .setOrigin(0.5)
    }

    // Restart prompt
    const prompt = this.add
      .text(width / 2, height * 0.76, "PRESS SPACE TO CONTINUE", {
        font: "20px monospace",
        fill: "#ffffff",
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: prompt,
      alpha: 0,
      duration: 500,
      ease: "Linear",
      yoyo: true,
      repeat: -1,
    })

    this.input.keyboard.once("keydown-SPACE", () => {
      if (victory) {
        this.scene.start("GameScene", { score, wave: wave + 1 })
      } else {
        this.scene.start("MenuScene")
      }
    })
  }
}
