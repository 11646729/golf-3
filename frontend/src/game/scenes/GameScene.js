import Phaser from "phaser"

const COLS = 11
const ROWS = 5
const ENEMY_START_X = 95
const ENEMY_START_Y = 80
const ENEMY_SPACING_X = 58
const ENEMY_SPACING_Y = 48
const CANVAS_W = 800
const CANVAS_H = 600
const PLAYER_Y = 548
const SHIELD_Y = 460
const SHIELD_XS = [150, 300, 500, 650]
const ROW_COLORS = [0xff00ff, 0xff00ff, 0x00ffff, 0x00ffff, 0xffff00]
const ROW_POINTS = [30, 30, 20, 20, 10]

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" })
  }

  create() {
    const data = this.scene.settings.data || {}
    this.score = data.score ?? 0
    this.wave = data.wave ?? 1
    this.lives = 3
    this.gameActive = true
    this.lastFired = 0
    this.enemyDirection = 1

    // Generate bullet textures before any physics groups are created
    const pg = this.make.graphics({ add: false })
    pg.fillStyle(0xffffff, 1).fillRect(0, 0, 4, 12)
    pg.generateTexture("pbullet", 4, 12)
    pg.destroy()

    const eg = this.make.graphics({ add: false })
    eg.fillStyle(0xff4444, 1).fillRect(0, 0, 4, 12)
    eg.generateTexture("ebullet", 4, 12)
    eg.destroy()

    this._createStars()
    this._createShields()
    this._createEnemies()
    this._createPlayer()
    this._createHUD()
    this._setupCollisions()
    this._setupEnemyStepTimer()
    this._setupEnemyFireTimer()

    this.cursors = this.input.keyboard.createCursorKeys()
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
  }

  update(time) {
    if (!this.gameActive) return

    // Player movement
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.body.setVelocityX(-300)
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.body.setVelocityX(300)
    } else {
      this.player.body.setVelocityX(0)
    }

    // Firing
    if (
      Phaser.Input.Keyboard.JustDown(this.keySpace) &&
      time - this.lastFired > 400 &&
      this.playerBullets.countActive(true) < 3
    ) {
      this._firePlayerBullet()
      this.lastFired = time
    }

    // Remove out-of-bounds bullets
    this.playerBullets.getChildren().forEach((b) => {
      if (b.active && b.y < -10) b.destroy()
    })
    this.enemyBullets.getChildren().forEach((b) => {
      if (b.active && b.y > CANVAS_H + 10) b.destroy()
    })

    // Check if enemies reached the player line
    this.enemies.getChildren().forEach((e) => {
      if (e.active && e.y > PLAYER_Y - 30) {
        this._triggerGameOver()
      }
    })
  }

  // ── Creation helpers ─────────────────────────────────────

  _createStars() {
    const gfx = this.add.graphics()
    gfx.fillStyle(0xffffff, 1)
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, CANVAS_W)
      const y = Phaser.Math.Between(0, CANVAS_H)
      gfx.fillRect(x, y, Math.random() < 0.2 ? 2 : 1, Math.random() < 0.2 ? 2 : 1)
    }
  }

  _createShields() {
    this.shields = this.physics.add.staticGroup()
    SHIELD_XS.forEach((x) => {
      const shield = this.add.rectangle(x, SHIELD_Y, 60, 30, 0x00cc44)
      this.physics.add.existing(shield, true)
      shield.hitCount = 0
      shield.maxHits = 4
      this.shields.add(shield)
    })
  }

  _createEnemies() {
    this.enemies = this.physics.add.group()
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = ENEMY_START_X + col * ENEMY_SPACING_X
        const y = ENEMY_START_Y + row * ENEMY_SPACING_Y
        const enemy = this.add.rectangle(x, y, 28, 18, ROW_COLORS[row])
        this.physics.add.existing(enemy)
        enemy.body.setAllowGravity(false)
        enemy.row = row
        this.enemies.add(enemy)
      }
    }
  }

  _createPlayer() {
    this.player = this.add.rectangle(CANVAS_W / 2, PLAYER_Y, 32, 16, 0x00ff44)
    this.physics.add.existing(this.player)
    this.player.body.setCollideWorldBounds(true)
    this.player.body.setAllowGravity(false)
    this.playerBullets = this.physics.add.group()
    this.enemyBullets = this.physics.add.group()
  }

  _createHUD() {
    const style = { font: "16px monospace", fill: "#ffffff" }
    this.scoreText = this.add.text(10, 10, `SCORE: ${this.score}`, style)
    this.waveText = this.add.text(CANVAS_W / 2, 10, `WAVE: ${this.wave}`, style).setOrigin(0.5, 0)
    this.livesText = this.add.text(CANVAS_W - 10, 10, `LIVES: ${this.lives}`, style).setOrigin(1, 0)
  }

  _setupCollisions() {
    this.physics.add.overlap(this.playerBullets, this.enemies, this._onBulletHitEnemy, null, this)
    this.physics.add.overlap(this.enemyBullets, this.player, this._onEnemyHitPlayer, null, this)
    this.physics.add.overlap(this.playerBullets, this.shields, this._onBulletHitShield, null, this)
    this.physics.add.overlap(this.enemyBullets, this.shields, this._onBulletHitShield, null, this)
  }

  _setupEnemyStepTimer() {
    const interval = this._stepInterval()
    this.enemyTimer = this.time.addEvent({
      delay: interval,
      callback: this._stepEnemies,
      callbackScope: this,
      loop: true,
    })
  }

  _setupEnemyFireTimer() {
    this.enemyFireTimer = this.time.addEvent({
      delay: 1200,
      callback: this._enemyFire,
      callbackScope: this,
      loop: true,
    })
  }

  // ── Game logic ───────────────────────────────────────────

  _stepInterval() {
    const alive = this.enemies.countActive(true)
    const base = Math.max(200, 800 - (this.wave - 1) * 100)
    return Math.max(80, base - (ROWS * COLS - alive) * 13)
  }

  _stepEnemies() {
    if (!this.gameActive) return
    const living = this.enemies.getChildren().filter((e) => e.active)
    if (living.length === 0) return

    const xs = living.map((e) => e.x)
    const leftX = Math.min(...xs)
    const rightX = Math.max(...xs)
    const stepX = 10

    let dropped = false
    if (this.enemyDirection === 1 && rightX + stepX > CANVAS_W - 20) {
      living.forEach((e) => (e.y += 20))
      this.enemyDirection = -1
      dropped = true
    } else if (this.enemyDirection === -1 && leftX - stepX < 20) {
      living.forEach((e) => (e.y += 20))
      this.enemyDirection = 1
      dropped = true
    }

    if (!dropped) {
      living.forEach((e) => (e.x += this.enemyDirection * stepX))
    }

    // Update static body positions for any shields (enemies use dynamic bodies)
    living.forEach((e) => e.body.reset(e.x, e.y))

    // Recalculate step interval
    const newDelay = this._stepInterval()
    this.enemyTimer.reset({
      delay: newDelay,
      callback: this._stepEnemies,
      callbackScope: this,
      loop: true,
    })
  }

  _enemyFire() {
    if (!this.gameActive) return
    const living = this.enemies.getChildren().filter((e) => e.active)
    if (living.length === 0) return

    // Gather bottom-most enemy per column
    const bottomByCol = {}
    living.forEach((e) => {
      const col = Math.round((e.x - ENEMY_START_X) / ENEMY_SPACING_X)
      if (!(col in bottomByCol) || e.y > bottomByCol[col].y) {
        bottomByCol[col] = e
      }
    })

    const candidates = Object.values(bottomByCol)
    const shooter = Phaser.Utils.Array.GetRandom(candidates)

    const bullet = this.physics.add.image(shooter.x, shooter.y + 16, "ebullet")
    bullet.body.setAllowGravity(false)
    bullet.body.setVelocityY(200)
    this.enemyBullets.add(bullet)
  }

  _firePlayerBullet() {
    const bullet = this.physics.add.image(this.player.x, this.player.y - 16, "pbullet")
    bullet.body.setAllowGravity(false)
    bullet.body.setVelocityY(-500)
    this.playerBullets.add(bullet)
  }

  // ── Collision callbacks ──────────────────────────────────

  _onBulletHitEnemy(bullet, enemy) {
    bullet.destroy()
    const pts = ROW_POINTS[enemy.row] ?? 10
    enemy.destroy()
    this.score += pts
    this.scoreText.setText(`SCORE: ${this.score}`)

    // Recalculate step speed
    const newDelay = this._stepInterval()
    this.enemyTimer.reset({
      delay: newDelay,
      callback: this._stepEnemies,
      callbackScope: this,
      loop: true,
    })

    this._checkWin()
  }

  _onEnemyHitPlayer(bullet, player) {
    if (!this.gameActive) return
    bullet.destroy()
    this.lives--
    this.livesText.setText(`LIVES: ${this.lives}`)

    // Flash the player
    this.tweens.add({
      targets: player,
      alpha: 0,
      duration: 100,
      ease: "Linear",
      yoyo: true,
      repeat: 3,
    })

    if (this.lives <= 0) {
      this.time.delayedCall(500, () => this._triggerGameOver())
    }
  }

  _onBulletHitShield(bullet, shield) {
    bullet.destroy()
    shield.hitCount++
    const ratio = shield.hitCount / shield.maxHits
    shield.setAlpha(1 - ratio * 0.8)
    if (shield.hitCount >= shield.maxHits) {
      shield.destroy()
    }
  }

  // ── End conditions ───────────────────────────────────────

  _checkWin() {
    if (this.enemies.countActive(true) === 0) {
      this.gameActive = false
      this.time.delayedCall(1200, () => {
        this.scene.start("GameOverScene", { score: this.score, wave: this.wave, victory: true })
      })
    }
  }

  _triggerGameOver() {
    if (!this.gameActive) return
    this.gameActive = false
    this.time.delayedCall(800, () => {
      this.scene.start("GameOverScene", { score: this.score, wave: this.wave, victory: false })
    })
  }
}
