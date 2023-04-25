// -------------------------------------------------------
// Function to fetch all shape_ids
// -------------------------------------------------------
const computeInsideMarginsRect = (rect) => {
  const MarginWidth = parseInt(process.env.REACT_APP_GEOPHONEARRAY_MARGINWIDTH)

  let insideMarginsRect = {
    top: rect.top + MarginWidth,
    bottom: rect.bottom - MarginWidth,
    left: rect.left + MarginWidth,
    right: rect.right - MarginWidth,
  }

  return insideMarginsRect
}

export { computeInsideMarginsRect as default }
