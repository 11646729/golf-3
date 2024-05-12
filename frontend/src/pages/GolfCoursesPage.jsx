import React, { useState, useEffect, memo } from "react"
import GolfCoursesTable from "../components/GolfCoursesTable"
import GolfCoursesMap from "../components/GolfCoursesMap"
import { getGolfCoursesData } from "../functionHandlers/loadGolfCoursesDataHandler"
import "../styles/golfcourses.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const GolfCoursesPage = () => {
  const [golfcourses, setGolfCoursesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  console.log(golfcourses)

  return (
    <div className="golfcoursescontainer">
      <div className="golfcoursestablecontainer">
        <GolfCoursesTable golfcourses={golfcourses} />
      </div>
      <div className="golfcoursesmapcontainer">
        <GolfCoursesMap isLoading={isLoading} golfcourses={golfcourses} />
      </div>
    </div>
  )
}

export default memo(GolfCoursesPage)
