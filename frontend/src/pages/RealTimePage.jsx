import React, { useEffect, useState, memo } from "react"
import socketIOClient from "socket.io-client"
// import RTCalendar from "../components/RTCalendar"
// import RTNews from "../components/RTNews"
// import RTWeather from "../components/RTWeather"
import "../styles/realtimehome.scss"
// import getTemperaturesData from "../functionHandlers/loadTemperaturesDataHandler"

const RealTimeHomePage = () => {
  const [loadClient, setLoadClient] = useState(false)

  return (
    <>
      {/* LOAD OR UNLOAD THE CLIENT */}
      {loadClient ? (
        //  if true
        <button onClick={() => setLoadClient((prevState) => !prevState)}>
          STOP CLIENT
        </button>
      ) : (
        // if false
        <button onClick={() => setLoadClient((prevState) => !prevState)}>
          START CLIENT
        </button>
      )}

      {/* SOCKET IO CLIENT*/}
      {loadClient ? <ClientComponent /> : null}
    </>
  )
}

const ClientComponent = () => {
  const [response, setResponse] = useState("")
  // const [temperatureReadings, setTemperatureReadings] = useState([])

  useEffect(() => {
    const socket = socketIOClient(
      process.env.REACT_APP_EXPRESS_SERVER_ENDPOINT_URL,
      {
        autoConnect: false,
      }
    )

    // Manual connect
    socket.connect()

    socket.on("FromTemperatureAPI", (data) => {
      setResponse(data)
      // setTemperatureReadings(data)
    })

    // socket.on("FromNewsAPI", (data) => {
    //   setResponse(data)
    // })

    // CLEAN UP THE EFFECT
    return () => socket.disconnect()
    //
  }, [])

  // const [calendarList, setCalendarList] = useState([])
  // const [calendarEvents, setCalendarEvents] = useState([])
  // const [newsItems, setNewsItems] = useState([])
  // const [temperatureReadings, setTemperatureReadings] = useState([])
  // const [isLoadingCalendarData, setIsLoadingCalendarData] = useState(true)
  // const [isLoadingTemperatureData, setIsLoadingTemperatureData] = useState(true)
  // const [isLoadingNewsData, setIsLoadingNewsData] = useState(true)

  // io.on("connection", (socket) => {
  //   console.log("a user connected")
  //   socket.on("disconnect", () => {
  //     console.log("user disconnected")
  //   })
  // })

  // socket.on("connect", () => {
  //   console.log(socket.id)
  // })

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

  // useEffect(() => {
  //   getTemperaturesData(process.env.REACT_APP_RT_WEATHER)
  //     .then((returnedData) => {
  //       // setTemperatureData((returnedData) => [...temperatureData, returnedData])
  //       setTemperatureReadings(returnedData)
  //       setIsLoadingTemperatureData(false)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  //   return () => socket.disconnect()
  // }, [])

  // useEffect(() => {
  //   socket.on("DataFromGoogleCalendarAPI", (currentData) => {
  //     setIsLoadingCalendarData(false)
  //     setCalendarEvents(currentData)
  //   })
  // }, [socket])

  // useEffect(() => {
  //   socket.on("DataFromOpenWeatherAPI", (currentData) => {
  //     setIsLoadingTemperatureData(false)
  //     setTemperatureReadings(currentData)
  //   })
  // }, [])

  // useEffect(() => {
  //   socket.on("DataFromOpenNewsAPI", (currentData) => {
  //     setIsLoadingNewsData(false)
  //     setNewsItems(currentData)
  //   })
  // }, [socket])

  // console.log(calendarEvents)

  return (
    <>
      <p>
        It's <time dateTime={response}>{response}</time>
      </p>
      <div className="home">
        {/* <div className="box box1">
    <RTCalendar
      isLoadingCalendarData={isLoadingCalendarData}
      calendarEvents={calendarEvents}
    />
  </div>
  <div className="box box2">
    <RTNews isLoadingNewsData={isLoadingNewsData} newsItems={newsItems} />
  </div>
  <div className="box box3">
    <RTWeather
      isLoadingTemperatureData={isLoadingTemperatureData}
      temperatureReadings={temperatureReadings}
    />
  </div> */}
        <div className="box box4">
          Golf Handicap, Trend & Practise, Next Tee Time
        </div>
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
    </>
  )
}

export default memo(RealTimeHomePage)
