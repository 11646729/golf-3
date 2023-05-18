import React, { memo } from "react"
import PropTypes from "prop-types"
import { Text, Rect } from "react-konva"

const DrawLegendAxisLabels = (props) => {
  const { rect } = props

  // If DrawLeftAxis !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTAXIS !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return

  DrawLegendAxisLabels.propTypes = {
    rect: PropTypes.object,
  }

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

  const ScaleValue = parseInt(
    (MaxAmplitude - MinAmplitude) / NoOfAmplitudeIntervalBands
  )
  const VerticalInterval = parseInt(
    (rect.bottom - rect.top) / NoOfAmplitudeIntervalBands
  )

  const values = []
  const legendRects = []
  const legendRectColors = []

  legendRectColors[1] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND1
  legendRectColors[2] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND2
  legendRectColors[3] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND3
  legendRectColors[4] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND4
  legendRectColors[5] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND5
  legendRectColors[6] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND6
  legendRectColors[7] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND7
  legendRectColors[8] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND8
  legendRectColors[9] = process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND9
  legendRectColors[10] =
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND10
  legendRectColors[11] =
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND11
  legendRectColors[12] =
    process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND12

  // for (let h = 1; h <= NoOfAmplitudeIntervalBands; h++) {
  //   const text = "process.env.REACT_APP_GEOPHONEARRAY_M3DRADIALCOLORBAND"
  //   let result = text.concat(h)
  //   legendRectColors[h] = result

  //   console.log(legendRectColors[h])
  // }

  for (let i = 0; i <= NoOfAmplitudeIntervalBands; i++) {
    const y = parseInt(rect.top + i * VerticalInterval)
    const x = rect.right - 50

    let AxisValue = MaxAmplitude - i * ScaleValue

    values.push(
      <Text
        key={i}
        fontSize={8}
        text={AxisValue}
        stroke="grey"
        strokeWidth={0.5}
        x={x}
        y={y - 3}
        align="right"
        verticalAlign="top"
      />
    )
  }

  for (let j = 0; j < NoOfAmplitudeIntervalBands; j++) {
    const y = parseInt(rect.top + j * VerticalInterval)
    const x = rect.right - 30
    const z = legendRectColors[j + 1]

    legendRects.push(
      <Rect
        key={j}
        x={x}
        y={y}
        width={rect.right - x}
        height={VerticalInterval}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH
        )}
        fill={z}
      />
    )
  }

  return (
    <>
      {values}
      {legendRects}
    </>
  )
}

export default memo(DrawLegendAxisLabels)
