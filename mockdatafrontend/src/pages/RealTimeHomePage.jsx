import React, { useState, memo } from "react"
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

      <HomePageContainer>
        <CardContainer>
          <Grid container>
            <Grid item sm={2} style={{ padding: 20 }}>
              <RTCalendarCard />
            </Grid>
            <Grid item sm={2} style={{ padding: 20 }}>
              <RTNewsCard />
            </Grid>
            <Grid item sm={2} style={{ padding: 20 }}>
              <RTWeatherCard />
            </Grid>
          </Grid>
        </CardContainer>
      </HomePageContainer>
    </div>
  )
}

export default memo(RealTimeHomePage)
