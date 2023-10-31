import React, { useEffect, useState, memo } from "react"
import RTCalendar from "../components/RTCalendar"
import RTNews from "../components/RTNews"
import { io } from "socket.io-client"
// import { getRTNewsItems } from "../functionHandlers/loadRTNewsDataHandler"
import {
  // getGoogleCalendarList,
  getGoogleCalendarEvents,
} from "../functionHandlers/loadRTCalendarDataHandler"
// import { getTemperaturesData } from "../functionHandlers/loadTemperaturesDataHandler"
import "../styles/realtimehome.scss"

const RealTimeHomePage = () => {
  // const [calendarList, setCalendarList] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [newsItems, setNewsItems] = useState([])
  const [weatherData, setWeatherData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   getGoogleCalendarList(process.env.REACT_APP_RT_GET_GOOGLE_CALENDAR_LIST)
  //     .then((returnedData) => {
  //       setCalendarList(returnedData)
  //       setIsLoading(false)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // }, [])

  const socket = io(process.env.REACT_APP_SOCKET_ENDPOINT_URL, {
    // autoConnect: false,
  })

  useEffect(() => {
    getGoogleCalendarEvents(process.env.REACT_APP_RT_GET_GOOGLE_CALENDAR_EVENTS) // Fetch data from Google Calendar
      .then((returnedData) => {
        setCalendarEvents(returnedData)
        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // useEffect(() => {
  //   getRTNewsItems(process.env.REACT_APP_RT_NEWS)
  //     .then((returnedData) => {
  //       setNewsItems(returnedData)
  //       setIsLoading(false)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // }, [])

  // useEffect(() => {
  //   getTemperaturesData(process.env.REACT_APP_RT_WEATHER)
  //     .then((returnedData) => {
  //       // setTemperatureData((returnedData) => [...temperatureData, returnedData])
  //       setWeatherData(returnedData)
  //       setIsLoading(false)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  //   // return () => socket.disconnect()
  // }, [])

  useEffect(() => {
    socket.on("DataFromOpenWeatherAPI", (currentData) => {
      setWeatherData(currentData)
    })
  }, [socket])

  useEffect(() => {
    socket.on("DataFromOpenNewsAPI", (currentData) => {
      setNewsItems(currentData)
    })
  }, [socket])

  // console.log(calendarList)

  return (
    <div className="home">
      <div className="box box1">
        <RTCalendar isLoading={isLoading} calendarEvents={calendarEvents} />
      </div>
      <div className="box box2">
        <RTNews isLoading={isLoading} newsItems={newsItems} />
      </div>
      <div className="box box3">
        Golf Course Weather & next Tee Time
        {/* <RTWeather isLoading={isLoading} weatherData={weatherData} /> */}
      </div>
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
