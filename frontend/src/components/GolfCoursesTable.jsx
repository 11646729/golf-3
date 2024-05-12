import React, { memo } from "react"
import PropTypes from "prop-types"
import Title from "./Title"
import "../styles/golfcoursestable.scss"

const GolfCoursesTableTitle = "Golf Courses Table"

const GolfCoursesTable = (props) => {
  const { golfcourses } = props

  GolfCoursesTable.propTypes = {
    golfcourses: PropTypes.array,
  }

  return (
    <div>
      <div className="golfcoursestablecontainer">
        <Title>{GolfCoursesTableTitle}</Title>
      </div>
      {/* golfcourses={golfcourses} */}
      golf courses selection
    </div>
  )
}

export default memo(GolfCoursesTable)
