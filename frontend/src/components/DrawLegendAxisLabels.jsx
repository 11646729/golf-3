import React, { memo } from "react"
import PropTypes from "prop-types"
import { Text } from "react-konva"

const DrawLegendAxisLabels = (props) => {
  const { rect } = props

  // If DrawLeftAxis !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTAXIS !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawLegendAxisLabels.propTypes = {
    rect: PropTypes.object,
  }

  // REACT_APP_GEOPHONEARRAY_MAXIMUMAMPLITUDE = "0.00"
  // REACT_APP_GEOPHONEARRAY_MINIMUMAMPLITUDE = "-96.00"
  // REACT_APP_GEOPHONEARRAY_NUMBEROFAMPLITUDEBANDS = "12"

  // Read Amplitude Values - Min, Max & Interval Values
  var MinAmplitude = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MINIMUMAMPLITUDE
  ).toFixed(2)

  var MaxAmplitude = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MAXIMUMAMPLITUDE
  ).toFixed(2)

  var NoOfAmplitudeIntervalBands = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_NUMBEROFAMPLITUDEBANDS
  ).toFixed(0)

  const ScaleVertical = (rect.bottom - rect.top) / NoOfAmplitudeIntervalBands
  // ((MaxAmplitude - MinAmplitude) / NoOfAmplitudeIntervalBands)

  const values = []

  for (let i = 0; i <= NoOfAmplitudeIntervalBands; i++) {
    const y = i * ScaleVertical
    //   const x1 = rect.left
    //   const x2 = rect.left - lineLength

    let AxisValue = MaxAmplitude - i * 8

    values.push(
      <>
        <Text
          fontSize={8}
          text={AxisValue}
          stroke="grey"
          strokeWidth={0.5}
          x={rect.left + 40}
          y={rect.top + y}
          align="left"
          verticalAlign="middle"
        />
      </>
    )
  }

  return <>{values}</>
}

export default memo(DrawLegendAxisLabels)
