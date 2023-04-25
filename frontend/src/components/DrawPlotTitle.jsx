import React, { memo } from "react"
import PropTypes from "prop-types"
import { Group, Text, Rect } from "react-konva"

const DrawPlotTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawPlotTitle.propTypes = {
    rect: PropTypes.object,
  }

  let plotTitleRect = null
  const MainPlotTitleHeight = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH
  )

  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWPLOTTITLE) {
    plotTitleRect = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.top + MainPlotTitleHeight,
    }
  } else {
    plotTitleRect = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    }
  }

  // console.log(rect)
  // console.log(plotTitleRect)

  return (
    <Group>
      <Rect
        x={plotTitleRect.left}
        y={plotTitleRect.top}
        width={plotTitleRect.right}
        height={plotTitleRect.bottom - plotTitleRect.top}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
        fill="lightgreen"
      />
      <Text
        text={process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLETEXT}
        fontSize={20}
        align="center"
        verticalAlign="middle"
        width={window.innerWidth}
        height={50}
      />
    </Group>
  )
}

export default memo(DrawPlotTitle)
