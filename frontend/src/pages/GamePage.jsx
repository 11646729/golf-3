import { memo } from "react"
import PhaserGame from "../game/PhaserGame"
import "../styles/game.scss"

const GamePage = () => {
  return (
    <div className="gamecontainer">
      <PhaserGame />
    </div>
  )
}

export default memo(GamePage)
