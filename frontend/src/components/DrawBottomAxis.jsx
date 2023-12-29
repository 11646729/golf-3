import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line, Text } from "react-konva"

const DrawBottomAxis = (props) => {
  const { rect, axisDraw } = props

  // If DrawBottomAxis !== true then return
  if (axisDraw !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawBottomAxis.propTypes = {
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
    const x = rect.left + i * ScaleHorizontal
    const y1 = rect.bottom
    const y2 = rect.bottom + lineLength

    lines.push(
      <Line
        key={i}
        points={[x, y1, x, y2]}
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
    const x = rect.left + j * ScaleHorizontal
    const y1 = rect.bottom

    let AxisValue = (parseFloat(MaxWaveNumber) - j * 0.02).toFixed(2)

    labels.push(
      <Text
        key={j}
        fontSize={8}
        text={AxisValue}
        stroke="grey"
        strokeWidth={0.5}
        x={x - 6}
        y={y1 + 15}
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

export default memo(DrawBottomAxis)
