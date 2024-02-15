import React, { useState, useEffect, memo } from "react"
// import "../styles/golfcourses.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const RTCalendarPage = () => {
  const [golfCourses, setGolfCoursesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // const golfDataUrl = "http://localhost:4000/api/golf/getGolfCourses"

  // useEffect(() => {
  //   getGolfCoursesData(golfDataUrl)
  //     .then((returnedData) => {
  //       setGolfCoursesData(returnedData)

  //       setIsLoading(false)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // }, [])

  console.log("Here I am")

  return (
    <div className="golfcoursescontainer">
      <div className="golfcoursestablecontainer">
        This is the RT Calendar Page - Live Data
        {/* <GolfCoursesTable golfCourses={golfCourses} /> */}
      </div>
      <div className="golfcoursesmapcontainer">
        This is the RT Calendar Page - Dummy Data
        {/* <GolfCoursesMap isLoading={isLoading} golfCourses={golfCourses} /> */}
      </div>
    </div>
  )
}

export default memo(RTCalendarPage)
