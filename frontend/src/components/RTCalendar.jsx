import React, { useState, useEffect, memo } from "react"
import { getRTCalendarData } from "../functionHandlers/loadRTCalendarDataHandler"
import moment from "moment"
import "../styles/calendar.scss"
import "../data"
import { calendarEvents } from "../data"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const RTCalendar = () => {
  // const [calendarEvents, setCalendarEventsData] = useState([])
  // const [isLoading, setIsLoading] = useState(true)

  // const calendarDataUrl = "http://localhost:4000/api/golf/getGolfCourses"

  // useEffect(() => {
  //   getRTCalendarData(calendarDataUrl)
  //     .then((returnedData) => {
  //       // setCalendarEventsData(returnedData)
  //       // setIsLoading(false)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // }, [])

  // console.log(calendarEvents)
  // var aistime = calendarEvents.tableData[0].DTSTAMP

  // console.log(aistime)
  console.log(moment.utc(calendarEvents.tableData[0].DTSTAMP).format("hh:mm"))

  return (
    <div className="table">
      <div className="caption">Calendar Events for Today Mon 17/08/23</div>
      <div className="thead">
        {/* <div className="tr"> */}
        {/* <div className="th">Time</div>
        <div className="th">Description</div> */}
        {/* </div> */}
      </div>
      {calendarEvents.tableData.map((item) => (
        <div className="tbody" key={item.id}>
          <div className="eventtime">
            {moment.utc(item.DTSTAMP).format("hh:mm")}
          </div>
          <div className="eventdescription">{item.event}</div>
        </div>
      ))}
    </div>
  )
}

export default memo(RTCalendar)
