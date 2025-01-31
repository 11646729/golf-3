// -------------------------------------------------------
// Function to compute ScreenEdgeRect - translated from C++ code
// -------------------------------------------------------
export const computeScreenEdgeRect = () => {
  console.log(window.innerWidth)

  return {
    top: 0,
    bottom:
      window.innerHeight -
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_DRAWERSIZEADJUSTMENT) -
      parseInt(import.meta.env.VITE_GEOPHONEARRAY_SIZEADJUSTMENT),
    left: 0,
    right: window.innerWidth - 500,
    // parseInt(import.meta.env.VITE_GEOPHONEARRAY_SIZEADJUSTMENT),
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
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWPLOTTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNPLOTTITLEWIDTH)
    : 0
}

const getTopTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWTOPTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNTOPTITLEWIDTH)
    : 0
}

const getBottomTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWBOTTOMTITLE ===
    "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNBOTTOMTITLEWIDTH)
    : 0
}

const getLeftTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWLEFTTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNLEFTTITLEWIDTH)
    : 0
}

const getRightTitleWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWRIGHTTITLE === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNRIGHTTITLEWIDTH)
    : 0
}

const getTopAxisWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWTOPAXIS === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNTOPAXISWIDTH)
    : 0
}

const getBottomAxisWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWBOTTOMAXIS === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNBOTTOMAXISWIDTH)
    : 0
}

const getLeftAxisWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWLEFTAXIS === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNLEFTAXISWIDTH)
    : 0
}

const getRightAxisWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNDRAWRIGHTAXIS === "true"
    ? parseInt(import.meta.env.VITE_GEOPHONEARRAY_ARRAYDESIGNRIGHTAXISWIDTH)
    : 0
}

const getLegendWidth = () => {
  return import.meta.env.VITE_GEOPHONEARRAY_DRAWLEGEND === "true"
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

// -------------------------------------------------------
// Function to compute ScaleHorizontal - translated from C++ code & refactored - for Vertical Lines
// -------------------------------------------------------
export const ScaleHorizontal = (rect, NoVLines, VLineSpacing) => {
  return (rect.right - rect.left) / ((NoVLines - 1) * VLineSpacing)
}

// -------------------------------------------------------
// Function to compute ScaleVertical - translated from C++ code & refactored - for Vertical Lines
// -------------------------------------------------------
export const ScaleVertical = (rect, NoHLines, HLineSpacing) => {
  return (rect.bottom - rect.top) / ((NoHLines - 1) * HLineSpacing)
}

// -------------------------------------------------------
// Function to compute SnapToGridV - translated from C++ code & refactored - for Horizontal Lines
// -------------------------------------------------------
export const snapToGridV = (tempy, HLineSpacing) => {
  let temp = tempy - HLineSpacing * parseInt(tempy / HLineSpacing)

  // const y =
  //   rect.bottom -
  //   parseInt(HLineSpacing * hline * ScaleVertical(rect, NoHLines, HLineSpacing))

  let test = 0

  if (temp >= 0.5 * HLineSpacing) test = tempy + (HLineSpacing - temp)
  else test = tempy - temp

  console.log(test)
}

// -------------------------------------------------------
// Function to compute SnapToGridH - translated from C++ code & refactored - for Vertical Lines
// -------------------------------------------------------
// export const snapToGridH = (tempy, VLineSpacing) => {
//   let temp = tempy - VLineSpacing * parseInt(tempy / VLineSpacing)
//   if (temp >= 0.5 * VLineSpacing) return tempy + (VLineSpacing - temp)
//   else return tempy - temp
// }

export { computeInsideMarginsRect as default }
