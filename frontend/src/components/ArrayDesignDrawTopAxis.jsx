import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line, Text } from "react-konva"

const DrawArrayDesignTopAxis = (props) => {
  const { axisDraw, rect, NoVLines, VLineSpacing } = props

  // If DrawTopAxis !== true then return
  if (axisDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawArrayDesignTopAxis.propTypes = {
    axisDraw: PropTypes.string,
    rect: PropTypes.object,
    NoVLines: PropTypes.string,
    VLineSpacing: PropTypes.string,
  }

  const ScaleHorizontal =
    (rect.right - rect.left) / ((NoVLines - 1) * VLineSpacing)

  // Scale the lineLength to screensize
  const lineLength = (rect.bottom - rect.top) / 60

  const lines = []
  const labels = []

  for (let vline = 0; vline < parseInt(NoVLines); vline++) {
    const x = rect.left + parseInt(VLineSpacing * vline * ScaleHorizontal)
    const y1 = rect.top
    const y2 = rect.top - lineLength

    lines.push(
      <Line
        key={vline}
        points={[x, y1, x, y2]}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
      />
    )
  }

  for (let vdistance = 0; vdistance < parseInt(NoVLines); vdistance++) {
    const x = rect.left + parseInt(VLineSpacing * vdistance * ScaleHorizontal)
    const y1 = rect.top

    let AxisValue = parseFloat(VLineSpacing * vdistance).toFixed(1)

    labels.push(
      <Text
        key={vdistance}
        fontSize={8}
        text={AxisValue}
        stroke="grey"
        strokeWidth={0.5}
        x={x - 9}
        y={y1 - 23}
        align="center"
        verticalAlign="middle"
      />
    )
  }

  return (
    <>
      {lines}
      {labels}
    </>
  )
}

export default memo(DrawArrayDesignTopAxis)
