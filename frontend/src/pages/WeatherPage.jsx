import { useState, useEffect, memo } from "react"
import TemperaturesTable from "../components/TemperaturesTable"
import TemperaturesChart from "../components/TemperaturesChart"
import { getTemperaturesData } from "../functionHandlers/loadTemperaturesDataHandler"
// import { io } from "socket.io-client"
import "../styles/weather.scss"

// const socket = io(process.env.VITE_EXPRESS_SERVER_ENDPOINT_URL, {
//   // autoConnect: false,
// })

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const WeatherPage = () => {
  const [temperatureData, setTemperatureData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   getTemperaturesData(process.env.VITE_RT_WEATHER)
  //     .then((returnedData) => {
  //       // setTemperatureData((returnedData) => [...temperatureData, returnedData])
  //       setTemperatureData(returnedData)

  //       console.log(returnedData)

  //       setIsLoading(false)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  //   return () => socket.disconnect()
  // }, [])

  // useEffect(() => {
  //   socket.on("DataFromOpenWeatherAPI", (currentData) => {
  //     console.log(currentData)
  //   })
  // }, [])

  // Now delete all except the last 20 readings
  // temperatureData.splice(0, temperatureData.length - 20)

  // const fetchRTTemperatureData = (temperatures) => {
  // socket.on("DataFromOpenWeatherAPI", (currentData) => {
  // console.log(currentData.length)

  // Need to cancel the Promise here to stop errors
  // setTemperatureData((temps) => [...temps, currentData])
  // })
  // Only display data for the last 20 values
  // temperatureData.splice(0, temperatureData.length - 20)
  // }

  // socket.on("connect", () => {
  //   console.log(socket.id) // x8WIv7-mJelg7on_ALbx
  // })

  // Listen for realtime temperature data and update the state
  // if (temperatureData.length > 0) {
  //   fetchRTTemperatureData(temperatureData)
  // }

  return (
    <div className="weathercontainer">
      <div className="weathertablecontainer">
        <TemperaturesTable temperaturesTableTitle="Temperatures Table" />
      </div>
      <div className="weatherchartcontainer">
        <TemperaturesChart
          isLoading={isLoading}
          temperatureData={temperatureData}
        />
      </div>
    </div>
  )
}

export default memo(WeatherPage)
