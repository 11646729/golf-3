import React, { useState, useEffect, memo } from "react"
// import { getRTCalendarData } from "../functionHandlers/loadRTCalendarDataHandler"
import moment from "moment"
import "../styles/news.scss"
import { newsEvents } from "../data"

// News API - https://docs.newscatcherapi.com

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const RTNews = () => {
  // const [newsEvents, setNewsEventsData] = useState([])
  // const [isLoading, setIsLoading] = useState(true)

  // const calendarDataUrl = "http://localhost:4000/api/golf/getGolfCourses"

  // useEffect(() => {
  //   getRTNewsData(calendarDataUrl)
  //     .then((returnedData) => {
  //       // setNewsEventsData(returnedData)
  //       // setIsLoading(false)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // }, [])

  return (
    <div className="table">
      <div className="caption">
        News Events for Today Mon{" "}
        {moment.utc(newsEvents.items[0].published_date).format("DD/MM/YYYY")}
      </div>
      {/* <div className="thead">
        <div className="tr">
          <div className="th">Time</div>
          <div className="th">Description</div>
        </div>
      </div> */}
      {/* {calendarEvents.tableData.map((item) => (
        <div className="tbody" key={item.id}>
          <div className="eventtime">
            {moment.utc(item.DTSTAMP).format("hh:mm")}
          </div>
          <div className="eventdescription">{item.event}</div>
        </div>
      ))} */}
    </div>
  )
}

export default memo(RTNews)
