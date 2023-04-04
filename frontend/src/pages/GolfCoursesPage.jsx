import React, { useState, useEffect, memo } from "react"
import styled from "styled-components"

import GolfCoursesTable from "../components/GolfCoursesTable"
import GolfCoursesMap from "../components/GolfCoursesMap"
import { getGolfCoursesData } from "../functionHandlers/loadGolfCoursesDataHandler"

const GolfCoursesContainer = styled.div`
  display: flex;
`

const GolfCoursesTableContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 500px;
`

const GolfCoursesMapContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 800px;
`

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const GolfCoursesPage = () => {
  const [golfCourses, setGolfCoursesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // build golfData Url
  const golfDataUrl = "http://localhost:4000/api/golf/getGolfCourses"

  useEffect(() => {
    getGolfCoursesData(golfDataUrl)
      .then((returnedData) => {
        setGolfCoursesData(returnedData)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <GolfCoursesContainer>
      <GolfCoursesTableContainer>
        <GolfCoursesTable golfCourses={golfCourses} />
      </GolfCoursesTableContainer>
      <GolfCoursesMapContainer>
        <GolfCoursesMap isLoading={isLoading} golfCourses={golfCourses} />
      </GolfCoursesMapContainer>
    </GolfCoursesContainer>
  )
}

export default memo(GolfCoursesPage)
