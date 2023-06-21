import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line, Text } from "react-konva"

const DrawArrayDesignTopAxis = (props) => {
  const { rect, axisDraw } = props

  // If DrawTopAxis !== true then return
  if (axisDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawArrayDesignTopAxis.propTypes = {
    rect: PropTypes.object,
    axisDraw: PropTypes.string,
  }

  // Read Axis Values - Min, Max & Interval Values
  var MinWaveNumber = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALMINIMUMWAVENUMBER
  ).toFixed(2)

  var MaxWaveNumber = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALMAXIMUMWAVENUMBER
  ).toFixed(2)

  var WaveNumberInterval = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALWAVENUMBERINTERVAL
  ).toFixed(2)

  const ScaleHorizontal =
    (rect.right - rect.left) /
    ((MaxWaveNumber - MinWaveNumber) / WaveNumberInterval)

  // Scale the lineLength to screensize
  const lineLength = (rect.bottom - rect.top) / 60

  const lines = []
  const labels = []

  for (
    let i = 0;
    i <= (MaxWaveNumber - MinWaveNumber) / WaveNumberInterval;
    i++
  ) {
    const x = rect.left + i * ScaleHorizontal
    const y1 = rect.top
    const y2 = rect.top - lineLength

    lines.push(
      <Line
        key={i}
        points={[x, y1, x, y2]}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
      />
    )
  }

  for (
    let j = 0;
    j <= (MaxWaveNumber - MinWaveNumber) / WaveNumberInterval;
    j++
  ) {
    const x = rect.left + j * ScaleHorizontal
    const y1 = rect.top

    let AxisValue = (parseFloat(MaxWaveNumber) - j * 0.02).toFixed(2)

    labels.push(
      <Text
        key={j}
        fontSize={8}
        text={AxisValue}
        stroke="grey"
        strokeWidth={0.5}
        x={x - 6}
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
