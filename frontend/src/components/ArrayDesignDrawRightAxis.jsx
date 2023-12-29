import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line, Text } from "react-konva"

const DrawArrayDesignRightAxis = (props) => {
  const { axisDraw, rect, NoHLines, HLineSpacing } = props

  // If axisDraw !== true then return
  if (axisDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawArrayDesignRightAxis.propTypes = {
    axisDraw: PropTypes.string,
    rect: PropTypes.object,
    NoHLines: PropTypes.string,
    HLineSpacing: PropTypes.string,
  }

  const ScaleVertical =
    (rect.bottom - rect.top) / ((NoHLines - 1) * HLineSpacing)

  // Scale the lineLength to screensize
  const lineLength = (rect.bottom - rect.top) / 60

  const lines = []
  const labels = []

  for (let hline = 0; hline < parseInt(NoHLines); hline++) {
    const y = rect.bottom - parseInt(HLineSpacing * hline * ScaleVertical)
    const x1 = rect.right
    const x2 = rect.right + lineLength

    lines.push(
      <Line
        key={hline}
        points={[x1, y, x2, y]}
        stroke={process.env.VITE_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.VITE_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
      />
    )
  }

  for (let hdistance = 0; hdistance < parseInt(NoHLines); hdistance++) {
    const x = rect.right
    const y1 = rect.top + parseInt(HLineSpacing * hdistance * ScaleVertical)

    let AxisValue = parseFloat(HLineSpacing * hdistance).toFixed(1)

    labels.push(
      <Text
        key={hdistance}
        fontSize={8}
        text={AxisValue}
        stroke="grey"
        strokeWidth={0.5}
        x={x + 30}
        y={y1 - 3}
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

export default memo(DrawArrayDesignRightAxis)
