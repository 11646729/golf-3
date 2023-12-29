import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line, Text } from "react-konva"

const DrawRightAxis = (props) => {
  const { rect, axisDraw } = props

  // If DrawRightAxis !== true then return
  if (axisDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawRightAxis.propTypes = {
    rect: PropTypes.object,
    axisDraw: PropTypes.string,
  }

  // Read Axis Values - Min, Max & Interval Values
  var MinWaveNumber = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMINIMUMWAVENUMBER
  ).toFixed(2)

  var MaxWaveNumber = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALMAXIMUMWAVENUMBER
  ).toFixed(2)

  var WaveNumberInterval = parseFloat(
    import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALWAVENUMBERINTERVAL
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
    const y = rect.top + i * ScaleHorizontal
    const x1 = rect.right
    const x2 = rect.right + lineLength

    lines.push(
      <Line
        key={i}
        points={[x1, y, x2, y]}
        stroke={import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          import.meta.env.VITE_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
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
    const y = rect.top + j * ScaleHorizontal
    const x2 = rect.right + lineLength

    let AxisValue = (parseFloat(MaxWaveNumber) - j * 0.02).toFixed(2)

    labels.push(
      <Text
        key={j}
        fontSize={8}
        text={AxisValue}
        stroke="grey"
        strokeWidth={0.5}
        x={x2 + 5}
        y={y - 4}
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

export default memo(DrawRightAxis)
