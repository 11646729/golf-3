import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawGridLines = (props) => {
  const { rect } = props

  if (!rect) return

  DrawGridLines.propTypes = {
    rect: PropTypes.object,
  }

  const VLineSpacing = 1
  const HLineSpacing = 0
  const NoVLines = 1
  const NoHLines = 6
  const ScaleHorizontal = 1
  const ScaleVertical = 0

  const lines = []

  // DRAW VERTICAL GRIDLINES FROM LEFT TO RIGHT
  if (process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWGRIDLINES === "true") {
    for (let line = 1; line <= NoVLines; line++) {
      const x1 = rect.left + VLineSpacing * line * ScaleHorizontal
      const y1 = rect.top
      const x2 = rect.left + VLineSpacing * line * ScaleHorizontal
      const y2 = rect.bottom

      lines.push(
        <Line
          key={line}
          points={[x1, y1, x2, y2]}
          stroke={
            process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNCHARTOUTLINECOLOR
          }
          strokeWidth={parseInt(
            process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNCHARTOUTLINEWIDTH
          )}
          dash={[10, 5]}
        />
      )
    }

    return <>{lines}</>
  }
}

export default memo(DrawGridLines)
