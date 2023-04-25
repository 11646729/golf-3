import React, { useEffect, useState, memo } from "react"
import { Stage, Layer } from "react-konva"
import DrawChartBox from "./DrawChartBox"
import DrawPlotTitle from "./DrawPlotTitle"
import DrawTopAxisTitle from "./DrawTopAxisTitle"
import DrawRadialLines from "./DrawRadialLines"

const CanvasDiagram = () => {
  // Hook is initialised with width & height values
  const [screenRect, setScreenRect] = useState({
    left: 0,
    top: 0,
    right: Math.round(
      window.innerWidth * process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT
    ),
    bottom: Math.round(
      window.innerHeight * process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT
    ),
  })
  const [insideMarginsRect, setInsideMarginsRect] = useState({
    left:
      screenRect.left +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    top:
      screenRect.top +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    right:
      screenRect.right -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    bottom:
      screenRect.bottom -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
  })

  useEffect(() => {
    const checkSize = () => {
      setScreenRect({
        left: 0,
        top: 0,
        right: Math.round(
          window.innerWidth * process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT
        ),
        bottom: Math.round(
          window.innerHeight *
            process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT
        ),
      })
      setInsideMarginsRect({
        left:
          screenRect.left +
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
        top:
          screenRect.top +
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
        right:
          screenRect.right -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
        bottom:
          screenRect.bottom -
          parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
      })
    }

    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [screenRect])

  // console.log(screenRect)
  // console.log(insideMarginsRect)

  // Prepare rectangles for titles, axes & legend

  return (
    <Stage width={screenRect.right} height={screenRect.bottom} margin={0}>
      <Layer>
        <DrawChartBox rect={insideMarginsRect} />
        <DrawPlotTitle rect={insideMarginsRect} />
        <DrawTopAxisTitle rect={insideMarginsRect} />
        {/* <DrawRadialLines rect={screenRect} /> */}
      </Layer>
    </Stage>
  )
}

export default memo(CanvasDiagram)
