import React, { memo } from "react"
import PropTypes from "prop-types"
import { Rect, Text } from "react-konva"

const DrawLegendArea = (props) => {
  const { rect } = props

  // If DrawLegend !== true then return
  if (process.env.REACT_APP_GEOPHONEARRAY_DRAWLEGEND !== "true") return
  // If rect is null then do not draw the Rectangle
  if (!rect) return
  // If rect width = 0 then do not draw the Rectangle
  if (rect.right - rect.left === 0) return

  DrawLegendArea.propTypes = {
    rect: PropTypes.object,
  }

  // Read Amplitude Values - Min, Max & Interval Values
  var MaxAmplitude = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MAXIMUMAMPLITUDE
  ).toFixed(2)

  var MinAmplitude = parseFloat(
    process.env.REACT_APP_GEOPHONEARRAY_MINIMUMAMPLITUDE
  ).toFixed(2)

  var NoOfAmplitudeBands = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_NUMBEROFAMPLITUDEBANDS
  ).toFixed(0)

  // const lines = []

  // for (
  //   let i = 0;
  //   i <= (MaxWaveNumber - MinWaveNumber) / NoOfAmplitudeBands;
  //   i++
  // ) {
  // }

  return (
    <>
      {/* Outline Rectangle for Legend */}
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
        // fill="lightcyan"
      />
      {/* Legend Title */}
      <Text
        fontSize={16}
        text={process.env.REACT_APP_GEOPHONEARRAY_LEGENDTEXT}
        stroke="grey"
        strokeWidth={0.5}
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        align="center"
        verticalAlign="top"
      />
      {/* Legend Dimension Label */}
      <Text
        fontSize={16}
        text={process.env.REACT_APP_GEOPHONEARRAY_LEGENDVALUESTEXT}
        stroke="grey"
        strokeWidth={0.5}
        x={rect.left}
        y={rect.top}
        width={rect.right - rect.left}
        height={rect.bottom - rect.top}
        align="left"
        verticalAlign="middle"
      />
    </>
  )
}

export default memo(DrawLegendArea)
