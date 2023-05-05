// -------------------------------------------------------
// Function to compute ScreenEdgeRect - translated from C++ code
// -------------------------------------------------------
export const computeScreenEdgeRect = () => {
  let screenEdgeRect = {
    top: 0,
    bottom:
      window.innerHeight -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT),
    left: 0,
    right:
      window.innerWidth -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT),
  }

  return screenEdgeRect
}

// -------------------------------------------------------
// Function to compute InsideMarginsRect - translated from C++ code
// -------------------------------------------------------
export const computeInsideMarginsRect = (ScreenEdgeRect) => {
  let insideMarginsRect = {
    top:
      ScreenEdgeRect.top +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    bottom:
      ScreenEdgeRect.bottom -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    left:
      ScreenEdgeRect.left +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
    right:
      ScreenEdgeRect.right -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH),
  }

  return insideMarginsRect
}

const getMainTitleWidth = () => {
  return process.env.REACT_APP_GEOPHONEARRAY_DRAWPLOTTITLE === "true"
    ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH)
    : 0
}

const getTopTitleWidth = () => {
  return process.env.REACT_APP_GEOPHONEARRAY_DRAWTOPTITLE === "true"
    ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPTITLEWIDTH)
    : 0
}
const getBottomTitleWidth = () => {
  return process.env.REACT_APP_GEOPHONEARRAY_DRAWBOTTOMTITLE === "true"
    ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMTITLEWIDTH)
    : 0
}

const getLeftTitleWidth = () => {
  return process.env.REACT_APP_GEOPHONEARRAY_DRAWLEFTTITLE === "true"
    ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTTITLEWIDTH)
    : 0
}

const getRightTitleWidth = () => {
  return process.env.REACT_APP_GEOPHONEARRAY_DRAWRIGHTTITLE === "true"
    ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTTITLEWIDTH)
    : 0
}

const getLegendWidth = () => {
  return process.env.REACT_APP_GEOPHONEARRAY_DRAWLEGEND === "true"
    ? parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEGENDWIDTH)
    : 0
}

// NOT WORKING
// ----------------
// export const computeTempHeight = (insidePlotTitleRect, insideMarginsRect) => {
//   return (
//     insideMarginsRect.bottom -
//     getBottomTitleWidth() -
//     parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH) -
//     insidePlotTitleRect.bottom +
//     getTopTitleWidth() +
//     parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH)
//   )
// }

// -------------------------------------------------------
// Function to compute InsidePlotTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeInsidePlotTitlesRect = (insideMarginsRect) => {
  return {
    top: insideMarginsRect.top,
    bottom: insideMarginsRect.top + getMainTitleWidth(),
    left: insideMarginsRect.left,
    right: insideMarginsRect.right,
  }
}

// -------------------------------------------------------
// Function to compute TopTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeTopTitlesRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  return {
    top: insidePlotTitleRect.bottom,
    bottom: insidePlotTitleRect.bottom + getTopTitleWidth(),
    left: insideMarginsRect.left,
    right: insideMarginsRect.right - getLegendWidth(),
  }
}

// -------------------------------------------------------
// Function to compute BottomTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeBottomTitlesRect = (insideMarginsRect) => {
  return {
    top: insideMarginsRect.bottom - getBottomTitleWidth(),
    bottom: insideMarginsRect.bottom,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right - getLegendWidth(),
  }
}

// -------------------------------------------------------
// Function to compute LeftTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeLeftTitlesRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  const tempHeight =
    insideMarginsRect.bottom -
    getBottomTitleWidth() -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH) -
    insidePlotTitleRect.bottom +
    getTopTitleWidth() +
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH)

  const tempWidth =
    insideMarginsRect.right -
    getRightTitleWidth() -
    getLegendWidth() -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
    (insideMarginsRect.left +
      getLeftTitleWidth() +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH))

  return {
    top: insidePlotTitleRect.bottom + getTopTitleWidth(),
    bottom: insideMarginsRect.bottom - getBottomTitleWidth(),
    left: insideMarginsRect.left + (tempWidth - tempHeight) / 2,
    right:
      insideMarginsRect.left +
      getLeftTitleWidth() +
      (tempWidth - tempHeight) / 2,
  }
}

// -------------------------------------------------------
// Function to compute RightTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeRightTitlesRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  const tempHeight =
    insideMarginsRect.bottom -
    getBottomTitleWidth() -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH) -
    insidePlotTitleRect.bottom +
    getTopTitleWidth() +
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH)

  const tempWidth =
    insideMarginsRect.right -
    getRightTitleWidth() -
    getLegendWidth() -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
    (insideMarginsRect.left +
      getLeftTitleWidth() +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH))

  return {
    top: insidePlotTitleRect.bottom + getTopTitleWidth(),
    bottom: insideMarginsRect.bottom - getBottomTitleWidth(),
    left:
      insideMarginsRect.right -
      getRightTitleWidth() -
      getLegendWidth() -
      (tempWidth - tempHeight) / 2,
    right:
      insideMarginsRect.right - getLegendWidth() - (tempWidth - tempHeight) / 2,
  }
}

// -------------------------------------------------------
// Function to compute GraphPlotAreaRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeGraphPlotAreaRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  const tempHeight =
    insideMarginsRect.bottom -
    getBottomTitleWidth() -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH) -
    insidePlotTitleRect.bottom +
    getTopTitleWidth() +
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH)

  const tempWidth =
    insideMarginsRect.right -
    getRightTitleWidth() -
    getLegendWidth() -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
    (insideMarginsRect.left +
      getLeftTitleWidth() +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH))

  return {
    top:
      insidePlotTitleRect.bottom +
      getTopTitleWidth() +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH),
    bottom:
      insideMarginsRect.bottom -
      getBottomTitleWidth() -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH),
    left:
      insideMarginsRect.left +
      getLeftTitleWidth() +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH) +
      (tempWidth - tempHeight) / 2,
    right:
      insideMarginsRect.right -
      getRightTitleWidth() -
      getLegendWidth() -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
      (tempWidth - tempHeight) / 2,
  }
}

// -------------------------------------------------------
// Function to compute LegendAreaRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeLegendAreaRect = (
  insidePlotTitleRect,
  insideMarginsRect
) => {
  const tempHeight =
    insideMarginsRect.bottom -
    getBottomTitleWidth() -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH) -
    insidePlotTitleRect.bottom +
    getTopTitleWidth() +
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH)

  const tempWidth =
    insideMarginsRect.right -
    getRightTitleWidth() -
    getLegendWidth() -
    parseInt(process.env.REACT_APP_GEOPHONEARRAY_RIGHTAXISWIDTH) -
    (insideMarginsRect.left +
      getLeftTitleWidth() +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_LEFTAXISWIDTH))

  return {
    top:
      insidePlotTitleRect.bottom +
      getTopTitleWidth() +
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_TOPAXISWIDTH),
    bottom:
      insideMarginsRect.bottom -
      getBottomTitleWidth() -
      parseInt(process.env.REACT_APP_GEOPHONEARRAY_BOTTOMAXISWIDTH),
    left:
      insideMarginsRect.right - getLegendWidth() - (tempWidth - tempHeight) / 2,
    right: insideMarginsRect.right,
  }
}

export { computeInsideMarginsRect as default }
