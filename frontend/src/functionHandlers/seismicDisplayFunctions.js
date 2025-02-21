// -------------------------------------------------------
// Function to compute ScreenEdgeRect - translated from C++ code
// -------------------------------------------------------
export const computeScreenEdgeRect = () => {
  return {
    top: 0,
    bottom:
      window.innerHeight -
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_DRAWERSIZEADJUSTMENT) -
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_SIZEADJUSTMENT),
    left: 0,
    right:
      window.innerWidth -
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_SIZEADJUSTMENT),
  }
}

// -------------------------------------------------------
// Function to compute InsideMarginsRect - translated from C++ code
// -------------------------------------------------------
export const computeInsideMarginsRect = (ScreenEdgeRect) => {
  return {
    top:
      ScreenEdgeRect.top +
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_MARGINWIDTH),
    bottom:
      ScreenEdgeRect.bottom -
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_MARGINWIDTH),
    left:
      ScreenEdgeRect.left +
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_MARGINWIDTH),
    right:
      ScreenEdgeRect.right -
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_MARGINWIDTH),
  }
}

// -------------------------------------------------------
// Function to fetch Widths of various Title, AxisRect & Legend rectangles - translated from C++ code
// -------------------------------------------------------
const getPlotTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWPLOTTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALPLOTTITLEWIDTH)
    : 0
}

const getTopTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWTOPTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALTOPTITLEWIDTH)
    : 0
}

const getBottomTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWBOTTOMTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALBOTTOMTITLEWIDTH)
    : 0
}

const getLeftTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWLEFTTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALLEFTTITLEWIDTH)
    : 0
}

const getRightTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWRIGHTTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALRIGHTTITLEWIDTH)
    : 0
}

const getTopAxisWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWTOPAXIS === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALTOPAXISWIDTH)
    : 0
}

const getBottomAxisWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWBOTTOMAXIS === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALBOTTOMAXISWIDTH)
    : 0
}

const getLeftAxisWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWLEFTAXIS === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALLEFTAXISWIDTH)
    : 0
}

const getRightAxisWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWRIGHTAXIS === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALRIGHTAXISWIDTH)
    : 0
}

const getLegendWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALDRAWLEGEND === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_M3DRADIALLEGENDWIDTH)
    : 0
}

const getScreenOrientation = (insideMarginsRect) => {
  const tempGraphPlotHeight =
    insideMarginsRect.bottom -
    insideMarginsRect.top -
    getPlotTitleWidth() -
    getBottomTitleWidth() -
    getTopTitleWidth() -
    getBottomAxisWidth() -
    getTopAxisWidth()

  const tempGraphPlotWidth =
    insideMarginsRect.right -
    insideMarginsRect.left -
    getRightTitleWidth() -
    getLeftTitleWidth() -
    getRightAxisWidth() -
    getLeftAxisWidth() -
    getLegendWidth()

  let ScreenOrientation = "Landscape"

  if (tempGraphPlotHeight > tempGraphPlotWidth) {
    ScreenOrientation = "Portrait"
  }

  return ScreenOrientation
}

// -------------------------------------------------------
// Function to compute InsidePlotTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeInsidePlotTitlesRect = (insideMarginsRect) => {
  return {
    top: insideMarginsRect.top,
    bottom: insideMarginsRect.top + getPlotTitleWidth(),
    left: insideMarginsRect.left,
    right: insideMarginsRect.right,
  }
}

// -------------------------------------------------------
// Function to compute TopTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeTopTitlesRect = (graphPlotAreaRect) => {
  return {
    top: graphPlotAreaRect.top - getTopAxisWidth() - getTopTitleWidth(),
    bottom: graphPlotAreaRect.top - getTopAxisWidth(),
    left: graphPlotAreaRect.left,
    right: graphPlotAreaRect.right,
  }
}

// -------------------------------------------------------
// Function to compute BottomTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeBottomTitlesRect = (graphPlotAreaRect) => {
  return {
    top: graphPlotAreaRect.bottom + getBottomAxisWidth(),
    bottom:
      graphPlotAreaRect.bottom + getBottomAxisWidth() + getBottomTitleWidth(),
    left: graphPlotAreaRect.left,
    right: graphPlotAreaRect.right,
  }
}

// -------------------------------------------------------
// Function to compute LeftTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeLeftTitlesRect = (graphPlotAreaRect) => {
  return {
    top: graphPlotAreaRect.top,
    bottom: graphPlotAreaRect.bottom,
    left: graphPlotAreaRect.left - getLeftAxisWidth() - getLeftTitleWidth(),
    right: graphPlotAreaRect.left - getLeftAxisWidth(),
  }
}

// -------------------------------------------------------
// Function to compute RightTitlesRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeRightTitlesRect = (graphPlotAreaRect) => {
  return {
    top: graphPlotAreaRect.top,
    bottom: graphPlotAreaRect.bottom,
    left: graphPlotAreaRect.right + getRightAxisWidth(),
    right: graphPlotAreaRect.right + getRightAxisWidth() + getRightTitleWidth(),
  }
}

// -------------------------------------------------------
// Function to compute GraphPlotAreaRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeGraphPlotAreaRect = (insideMarginsRect) => {
  // Firstly compute GraphPlot Height & Width
  const tempGraphPlotHeight =
    insideMarginsRect.bottom -
    insideMarginsRect.top -
    getPlotTitleWidth() -
    getBottomTitleWidth() -
    getTopTitleWidth() -
    getBottomAxisWidth() -
    getTopAxisWidth()

  // const tempGraphPlotWidth =
  //   insideMarginsRect.right -
  //   insideMarginsRect.left -
  //   getRightTitleWidth() -
  //   getLeftTitleWidth() -
  //   getRightAxisWidth() -
  //   getLeftAxisWidth() -
  //   getLegendWidth()

  let screenOrientation = getScreenOrientation(insideMarginsRect)

  let insideGraphPlotRect = null

  // if (tempGraphPlotHeight <= tempGraphPlotWidth) {

  if (screenOrientation === "Landscape") {
    const spaceBeforeTitles = Math.round(
      (insideMarginsRect.right -
        insideMarginsRect.left -
        getLeftTitleWidth() -
        getRightTitleWidth() -
        getLeftAxisWidth() -
        getRightAxisWidth() -
        tempGraphPlotHeight) /
        2
    )

    // Landscape mode
    insideGraphPlotRect = {
      top:
        insideMarginsRect.top +
        getPlotTitleWidth() +
        getTopTitleWidth() +
        getTopAxisWidth(),
      bottom:
        insideMarginsRect.bottom - getBottomTitleWidth() - getBottomAxisWidth(),
      left: Math.round(
        insideMarginsRect.left +
          spaceBeforeTitles +
          getLeftTitleWidth() +
          getLeftAxisWidth()
      ),
      right:
        insideMarginsRect.right -
        spaceBeforeTitles -
        getRightTitleWidth() -
        getRightAxisWidth(),
    }
  } else {
    // Portrait mode
    // TODO
    insideGraphPlotRect = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }
  }

  return insideGraphPlotRect
}

// -------------------------------------------------------
// Function to compute LegendAreaRect - translated from C++ code & refactored
// -------------------------------------------------------
export const computeLegendAreaRect = (insideMarginsRect, rightTitleRect) => {
  let legendRect = {
    top: rightTitleRect.top,
    bottom: rightTitleRect.bottom,
    left:
      rightTitleRect.right +
      (insideMarginsRect.right - rightTitleRect.right - getLegendWidth()) / 2,
    right:
      rightTitleRect.right +
      (insideMarginsRect.right - rightTitleRect.right + getLegendWidth()) / 2,
  }

  return legendRect
}

export { computeInsideMarginsRect as default }
