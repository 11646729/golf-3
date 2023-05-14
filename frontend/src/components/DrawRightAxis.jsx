import React, { memo } from "react"
import PropTypes from "prop-types"
import { Line, Text } from "react-konva"

const DrawRightAxis = (props) => {
  const { rect } = props

  // If DrawRightAxis !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWRIGHTAXIS !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawRightAxis.propTypes = {
    rect: PropTypes.object,
  }

  // Read Axis Values - Min, Max & Interval Values
  var MinWaveNumber = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MINIMUMWAVENUMBER
  ).toFixed(2)

  var MaxWaveNumber = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MAXIMUMWAVENUMBER
  ).toFixed(2)

  var WaveNumberInterval = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_WAVENUMBERINTERVAL
  ).toFixed(2)

  const ScaleHorizontal =
    (rect.right - rect.left) /
    ((MaxWaveNumber - MinWaveNumber) / WaveNumberInterval)

  // Scale the lineLength to screensize
  const lineLength = (rect.bottom - rect.top) / 60

  const lines = []

  for (
    let i = 0;
    i <= (MaxWaveNumber - MinWaveNumber) / WaveNumberInterval;
    i++
  ) {
    const y = rect.top + i * ScaleHorizontal
    const x1 = rect.right
    const x2 = rect.right + lineLength

    let AxisValue = (parseFloat(MaxWaveNumber) - i * 0.02).toFixed(2)

    lines.push(
      <>
        <Line
          key={i}
          points={[x1, y, x2, y]}
          stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
          strokeWidth={parseInt(
            process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
            10
          )}
        />
        <Text
          fontSize={8}
          text={AxisValue}
          stroke="grey"
          strokeWidth={0.5}
          x={x2 + 5}
          y={y - 4}
          align="center"
          verticalAlign="middle"
        />
      </>
    )
  }

  return <>{lines}</>
}

export default memo(DrawRightAxis)
