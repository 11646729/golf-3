import React, { memo } from "react"
import PropTypes from "prop-types"
import { Group, Rect } from "react-konva"

const DrawBottomTitle = (props) => {
  const { rect } = props

  if (!rect) return

  DrawBottomTitle.propTypes = {
    rect: PropTypes.object,
  }

  console.log(rect)

  return (
    <Group>
      <Rect
        x={rect.left}
        y={rect.top}
        width={rect.right}
        height={rect.bottom - rect.top}
        stroke={process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINECOLOR}
        strokeWidth={parseInt(
          process.env.REACT_APP_GEOPHONEARRAY_CHARTOUTLINEWIDTH,
          10
        )}
        fill="orange"
      />
    </Group>
  )
}

export default memo(DrawBottomTitle)
