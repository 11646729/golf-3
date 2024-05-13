import React, { useState, useEffect, memo } from "react"
import "../styles/rtcalendar.scss"

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
    <div className="rtcalendarcontainer">
      <div className="rtcalendartablecontainer">
        This is the RT Calendar Page - Live Data
      </div>
    </div>
  )
}

export default memo(RTCalendarPage)
