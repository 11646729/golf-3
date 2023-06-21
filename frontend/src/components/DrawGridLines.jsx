import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"

const DrawGridLines = (props) => {
  const { rect, NoVLines, NoHLines, VLineSpacing, HLineSpacing } = props

  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  DrawGridLines.propTypes = {
    rect: PropTypes.object,
    NoVLines: PropTypes.string,
    NoHLines: PropTypes.string,
    VLineSpacing: PropTypes.string,
    HLineSpacing: PropTypes.string,
  }

  const ScaleHorizontal =
    (rect.right - rect.left) / ((NoVLines - 1) * VLineSpacing)

  const ScaleVertical =
    (rect.bottom - rect.top) / ((NoHLines - 1) * HLineSpacing)

  // console.log(ScaleHorizontal)

  const vlines = []
  const hlines = []

  // DRAW VERTICAL GRIDLINES FROM LEFT TO RIGHT
  if (process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWGRIDLINES === "true") {
    for (let vline = 0; vline < parseInt(NoVLines); vline++) {
      const x1 = rect.left + parseInt(VLineSpacing * vline * ScaleHorizontal)
      const y1 = rect.top
      const x2 = rect.left + parseInt(VLineSpacing * vline * ScaleHorizontal)
      const y2 = rect.bottom

      vlines.push(
        <Line
          key={vline}
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
    for (let hline = 0; hline < parseInt(NoHLines); hline++) {
      const x1 = rect.left
      const y1 = rect.bottom - parseInt(HLineSpacing * hline * ScaleVertical)
      const x2 = rect.right
      const y2 = rect.bottom - parseInt(HLineSpacing * hline * ScaleVertical)

      hlines.push(
        <Line
          key={hline}
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

    return (
      <>
        {vlines}
        {hlines}
      </>
    )
  }
}

export default memo(DrawGridLines)
