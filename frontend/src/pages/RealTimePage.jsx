import React, { useEffect, useState, memo } from "react"
import RTCalendar from "../components/RTCalendar"
import RTNews from "../components/RTNews"
import // getDummyRTNewsData,
// getRTNewsData,
"../functionHandlers/loadRTNewsDataHandler"
import {
  // loadRTCalendarEventsHandler,
  getRTCalendarEvents,
} from "../functionHandlers/loadRTCalendarDataHandler"
import "../styles/realtimehome.scss"

const RealTimeHomePage = () => {
  const [calendarEvents, setCalendarEvents] = useState([])
  // const [newsEvents, setNewsEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const rtCalendarEventsUrl =
    "http://localhost:4000/api/rtcalendar/getRTCalendarEvents"

  useEffect(() => {
    // loadRTCalendarEventsHandler()

    getRTCalendarEvents(rtCalendarEventsUrl)
      .then((returnedData) => {
        setCalendarEvents(returnedData)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <div className="home">
      <div className="box box1">
        <RTCalendar isLoading={isLoading} calendarEvents={calendarEvents} />
      </div>
      <div className="box box2">
        {/* <RTNews isLoading={isLoading} newsEvents={newsEvents} /> */}
      </div>
      <div className="box box3">Golf Course Weather & next Tee Time</div>
      <div className="box box4">Golf Handicap, Trend & Practise</div>
      <div className="box box5">Cruise Ships in Belfast or En Route</div>
      <div className="box box6">Traffic</div>
      <div className="box box7">Shares</div>
      <div className="box box8">Crimes</div>
      <div className="box box9">Bus Services</div>
      <div className="box box10">Learning</div>
      <div className="box box11">
        Book Tee Time
        {/* https://www.cgc-ni.com/memberbooking/?date=06-09-2023&course=1 */}
      </div>
      <div className="box box12">Crime Prevention Advice</div>
      <div className="box box13">Seismic Productivity</div>
    </div>
  )
}

export default memo(RealTimeHomePage)
