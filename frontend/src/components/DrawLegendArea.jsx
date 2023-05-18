import React, { memo } from "react"
import PropTypes from "prop-types"
import { Text } from "react-konva"
import DrawLegendAxisLabels from "./DrawLegendAxisLabels"

const DrawLegendArea = (props) => {
  const { rect } = props

  // If DrawLegend !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEGEND !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  DrawLegendArea.propTypes = {
    rect: PropTypes.object,
  }

  return (
    <>
      {/* Outline Rectangle for Legend */}
      {/* <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
        // fill="lightcyan"
      /> */}
      {/* Legend Dimension Label */}
      <Text
        fontSize={16}
        text={process.env.REACT_APP_GEOPHONEARRAY_LEGENDVALUESTEXT}
        stroke="grey"
        strokeWidth={0.5}
        x={rect.left + 10}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        align="left"
        verticalAlign="middle"
      />
      <DrawLegendAxisLabels rect={rect} />
    </>
  )
}

export default memo(DrawLegendArea)
