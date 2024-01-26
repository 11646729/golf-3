import React, { memo } from "react"
import PropTypes from "prop-types"

const StatusIcon = (props) => {
  const { size, status, onShow } = props

  StatusIcon.propTypes = {
    size: PropTypes.number.isRequired,
    status: PropTypes.bool.isRequired,
    onShow: PropTypes.func.isRequired,
  }

  return (
    <svg
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      height={`${2 * size}px`}
      width={`${2 * size}px`}
      onClick={onShow}
    >
      {status ? (
        //  if true then Green
        <circle cx={`${size}`} cy={`${size}`} r="4" fill="#008000" />
      ) : (
        // if false then Red
        <circle cx={`${size}`} cy={`${size}`} r="4" fill="#ff0000" />
      )}
    </svg>
  )
}

export default memo(StatusIcon)
