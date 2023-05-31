import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawGridLines = (props) => {
  const { rect } = props

  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  DrawGridLines.propTypes = {
    rect: PropTypes.object,
  }

  const VLineSpacing = 8.33
  const HLineSpacing = 8.33
  const NoVLines = 12
  const NoHLines = 12
  const ScaleHorizontal =
    (rect.right - rect.left) / ((NoVLines - 1) * VLineSpacing)
  const ScaleVertical =
    (rect.bottom - rect.top) / ((NoHLines - 1) * HLineSpacing)

  const lines = []

  // DRAW VERTICAL GRIDLINES FROM LEFT TO RIGHT
  if (process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWGRIDLINES === "true") {
    for (let line = 0; line < NoVLines; line++) {
      const x1 = rect.left + parseInt(VLineSpacing * line * ScaleHorizontal)
      const y1 = rect.top
      const x2 = rect.left + parseInt(VLineSpacing * line * ScaleHorizontal)
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
          dash={[5, 5]}
        />
      )
    }

    // DRAW HORIZONTAL GRIDLINES FROM BOTTOM TO TOP - Line 1 is at bottom of screen
    for (let row = 0; row < NoHLines; row++) {
      const x1 = rect.left
      const y1 = rect.bottom - parseInt(HLineSpacing * row * ScaleVertical)
      const x2 = rect.right
      const y2 = rect.bottom - parseInt(HLineSpacing * row * ScaleVertical)

      lines.push(
        <Line
          key={row}
          points={[x1, y1, x2, y2]}
          stroke={
            process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNCHARTOUTLINECOLOR
          }
          strokeWidth={parseInt(
            process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNCHARTOUTLINEWIDTH
          )}
          dash={[5, 5]}
        />
      )
    }

    return <>{lines}</>
  }
}

export default memo(DrawGridLines)
