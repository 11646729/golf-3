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
