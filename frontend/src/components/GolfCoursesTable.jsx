import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Title from "./Title"

const GolfCoursesTableTitle = "Golf Courses Table"

const GolfCourseTableContainer = styled.div`
  min-width: 200px;
  margin-left: 20px;
  margin-right: 10px;
  margin-bottom: 20px;
  font-weight: normal;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
`

const GolfCourseTableTitleContainer = styled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const GolfCoursesTable = (props) => {
  const { golfCourses } = props

  GolfCoursesTable.propTypes = {
    golfCourses: PropTypes.array,
  }

  return (
    <div>
      <GolfCourseTableTitleContainer>
        <Title>{GolfCoursesTableTitle}</Title>
      </GolfCourseTableTitleContainer>
      <GolfCourseTableContainer golfCourses={golfCourses}>
        golf courses selection
      </GolfCourseTableContainer>
    </div>
  )
}

export default memo(GolfCoursesTable)
