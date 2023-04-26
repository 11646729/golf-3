// -------------------------------------------------------
// Function to compute ScreenEdgeRect - translated from C++ code
// -------------------------------------------------------
export const computeScreenEdgeRect = () => {
  const screenSizeAdjustment =
    process.env.REACT_APP_GEOPHONEARRAY_SIZEADJUSTMENT

  let screenEdgeRect = {
    top: 0,
    bottom: Math.round(window.innerHeight * screenSizeAdjustment),
    left: 0,
    right: Math.round(window.innerWidth * screenSizeAdjustment),
  }

  return screenEdgeRect
}

// -------------------------------------------------------
// Function to compute InsideMarginsRect - translated from C++ code
// -------------------------------------------------------
export const computeInsideMarginsRect = (ScreenEdge) => {
  const marginWidth = parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH)

  let insideMarginsRect = {
    top: ScreenEdge.top + marginWidth,
    bottom: ScreenEdge.bottom - marginWidth,
    left: ScreenEdge.left + marginWidth,
    right: ScreenEdge.right - marginWidth,
  }

  return insideMarginsRect
}

// -------------------------------------------------------
// Function to compute InsideMarginsRect - translated from C++ code
// -------------------------------------------------------
export const computePlotTitlesRect = (insideMarginsRect) => {
  const MainTitleHeight = parseInt(
    process.env.REACT_APP_GEOPHONEARRAY_PLOTTITLEWIDTH
  )

  // const MainTitleHeight = 0

  let insidePlotTitleRect = {
    top: insideMarginsRect.top,
    bottom: insideMarginsRect.top + MainTitleHeight,
    left: insideMarginsRect.left,
    right: insideMarginsRect.right,
  }

  return insidePlotTitleRect
}

export { computeInsideMarginsRect as default }
