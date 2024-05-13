import React, { memo } from "react"
import PropTypes from "prop-types"
import Title from "./Title"
import "../styles/temperaturestable.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const TemperaturesTable = (props) => {
  const { temperaturesTableTitle } = props

  TemperaturesTable.propTypes = {
    temperaturesTableTitle: PropTypes.string,
  }

  return (
    <div>
      <div className="temperaturestabletitlecontainer">
        <Title>{temperaturesTableTitle}</Title>
      </div>
      <div className="temperaturestablecontainer">temperatures selection</div>
    </div>
  )
}

export default memo(TemperaturesTable)
