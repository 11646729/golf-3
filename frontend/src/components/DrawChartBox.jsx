import React, { memo } from "react"
import PropTypes from "prop-types"
import { Circle, Group, Rect } from "react-konva"

const DrawChartBox = (props) => {
  const { rect } = props

  if (!rect) return

  DrawChartBox.propTypes = {
    rect: PropTypes.object,
  }

  // const rectangleYPosition =
  //   rect.iHeight *
  //   (process.env.REACT_APP_GEOPHONEARRAY_TOPMARGINPERCENTAGE / 100)
  // const chartXPosition = rect.iWidth / 2
  // const chartYPosition = rect.iHeight / 2
  // const circleRadius =
  //   (rect.iHeight *
  //     (1 -
  //       process.env.REACT_APP_GEOPHONEARRAY_TOPMARGINPERCENTAGE / 100 -
  //       process.env.REACT_APP_GEOPHONEARRAY_BOTTOMMARGINPERCENTAGE / 100)) /
  //   2
  // const rectangleXPosition = (rect.iWidth - circleRadius * 2) / 2

  return (
    <Group>
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right}
        height={rect.bottom}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
      />
      {/* <Circle
        x={chartXPosition}
        y={chartYPosition}
        radius={circleRadius}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_SHAPESOUTLINEWIDTH,
          10
        )}
      /> */}
    </Group>
  )
}

export default memo(DrawChartBox)
