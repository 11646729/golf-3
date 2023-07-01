import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line } from "react-konva"
import {
  ScaleHorizontal,
  ScaleVertical,
} from "../functionHandlers/seismicDesignFunctions"

const ArrayDesignDrawGridLines = (props) => {
  const {
    gridlinesDraw,
    rect,
    NoVLines,
    NoHLines,
    VLineSpacing,
    HLineSpacing,
  } = props

  // If DrawGridLines !== true then return
  if (gridlinesDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  ArrayDesignDrawGridLines.propTypes = {
    gridlinesDraw: PropTypes.string,
    rect: PropTypes.object,
    NoVLines: PropTypes.string,
    NoHLines: PropTypes.string,
    VLineSpacing: PropTypes.string,
    HLineSpacing: PropTypes.string,
  }

  const vlines = []
  const hlines = []

  // DRAW VERTICAL GRIDLINES FROM LEFT TO RIGHT
  if (process.env.REACT_APP_GEOPHONEARRAY_ARRAYDESIGNDRAWGRIDLINES === "true") {
    for (let vline = 0; vline < parseInt(NoVLines); vline++) {
      const x =
        rect.left +
        parseInt(
          VLineSpacing * vline * ScaleHorizontal(rect, NoVLines, VLineSpacing)
        )
      const y1 = rect.top
      const y2 = rect.bottom

      vlines.push(
        <Line
          key={vline}
          points={[x, y1, x, y2]}
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
      const y =
        rect.bottom -
        parseInt(
          HLineSpacing * hline * ScaleVertical(rect, NoHLines, HLineSpacing)
        )
      const x2 = rect.right

      hlines.push(
        <Line
          key={hline}
          points={[x1, y, x2, y]}
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

export default memo(ArrayDesignDrawGridLines)
