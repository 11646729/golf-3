import React, { useState, useEffect, memo } from "react"
import { getRTCalendarData } from "../functionHandlers/loadRTCalendarDataHandler"
import "../styles/calendar.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const RTCalendar = () => {
  const [calendarEvents, setCalendarEventsData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const calendarDataUrl = "http://localhost:4000/api/golf/getGolfCourses"

  useEffect(() => {
    getRTCalendarData(calendarDataUrl)
      .then((returnedData) => {
        setCalendarEventsData(returnedData)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <div className="calendarmain">
      <div className="calendartitle">Calendar Events for 17/08/23</div>
      <div className="calendareventscontainer">Time Description</div>
    </div>
  )
}

export default memo(RTCalendar)
