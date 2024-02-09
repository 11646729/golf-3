import React, { useEffect, useState, memo } from "react"
import { getGoogleCalendarEvents } from "../functionHandlers/loadRTCalendarDataHandler"
import { Grid } from "@mui/material"
import styled from "styled-components"

import RTNewsCard from "../cards/RTNewsCard"
import RTCalendarCard from "../cards/RTCalendarCard"
import RTWeatherCard from "../cards/RTWeatherCard"

const HomePageContainer = styled.div`
  display: flex;
`

const CardContainer = styled.div`
  flex: 4;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  width: 100%;
  min-height: 500px;
`

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

  return (
    <div>
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

      <HomePageContainer>
        <CardContainer>
          <Grid container>
            <Grid item sm={3} style={{ padding: 20 }}>
              <RTCalendarCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              <RTNewsCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              <RTWeatherCard />
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              {/* <NearbyCrimesCard /> */}
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              {/* <CruiseCard /> */}
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              {/* <BusRoutesCard /> */}
            </Grid>
            <Grid item sm={3} style={{ padding: 20 }}>
              {/* <SeismicDesignCard /> */}
            </Grid>
          </Grid>
        </CardContainer>
      </HomePageContainer>
    </div>
  )
}

export default memo(RealTimeHomePage)
