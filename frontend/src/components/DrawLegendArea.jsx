import React, { memo } from "react"
import PropTypes from "prop-types"
import { Text } from "react-konva"
import DrawLegendAxisLabels from "./DrawLegendAxisLabels"

const DrawLegendArea = (props) => {
  const { rect, legendDraw, legendText } = props

  // If DrawLegend !== true then return
  if (legendDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  DrawLegendArea.propTypes = {
    rect: PropTypes.object,
    legendDraw: PropTypes.string,
    legendText: PropTypes.string,
  }

  return (
    <>
      <Text
        fontSize={16}
        text={legendText}
        stroke="grey"
        strokeWidth={0.5}
        x={rect.left + 10}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        align="left"
        verticalAlign="middle"
      />
      <DrawLegendAxisLabels
        rect={rect}
        legendDraw={legendDraw}
        greyScale={process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALGREYSCALE}
      />
    </>
  )
}

export default memo(DrawLegendArea)
