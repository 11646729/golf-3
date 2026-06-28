import { useEffect, useRef } from "react"
import Phaser from "phaser"
import { getPhaserConfig } from "./config"

const PhaserGame = () => {
  const containerRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    if (gameRef.current) return
    gameRef.current = new Phaser.Game(getPhaserConfig(containerRef.current))
    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return <div ref={containerRef} id="phaser-container" />
}

export default PhaserGame
