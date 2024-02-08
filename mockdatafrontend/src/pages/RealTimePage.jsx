import React, { useEffect, useState, memo } from "react"
import { getGoogleCalendarEvents } from "../functionHandlers/loadRTCalendarDataHandler"

const RealTimeHomePage = () => {
  const [loadClient, setLoadClient] = useState(false)

  const golfRTCalendarUrl = "http://localhost:4000/api/golf/getGolfCourses"

  useEffect(() => {
    getGoogleCalendarEvents(golfRTCalendarUrl)
      .then((returnedData) => {
        // setGolfCoursesData(returnedData)
        // setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // console.log(golfCourses)

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
      {/* {loadClient ? <ClientComponent /> : null} */}
    </>
  )
}

export default memo(RealTimeHomePage)
