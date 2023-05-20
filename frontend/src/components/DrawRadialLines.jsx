import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawRadialLines = (props) => {
  const { rect } = props

  if (!rect) return

  DrawRadialLines.propTypes = {
    rect: PropTypes.object,
  }

  const NoOfAngles = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALNOOFANGLES
  )

  const pi_rad = Math.PI / 180

  if (
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALDISPLAYRADIALLINES === "true"
  ) {
    const lines = []

    for (let i = 1; i <= NoOfAngles; i++) {
      const dOffx =
        ((rect.bottom - rect.top) / 2) *
        Math.sin((360 / NoOfAngles) * pi_rad * i)
      const dOffy =
        0 -
        ((rect.bottom - rect.top) / 2) *
          Math.cos((360 / NoOfAngles) * pi_rad * i)

      const y1 = rect.top + (rect.bottom - rect.top) / 2
      const x1 = rect.left + (rect.right - rect.left) / 2
      const y2 = rect.top + (rect.bottom - rect.top) / 2 + dOffy
      const x2 = rect.left + (rect.right - rect.left) / 2 + dOffx

      lines.push(
        <Line
          key={i}
          points={[x1, y1, x2, y2]}
          stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
          strokeWidth={parseInt(
            process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
          )}
        />
      )
    }

    return <>{lines}</>
  }
}

export default memo(DrawRadialLines)
