import React, { memo } from "react"
import { Grid } from "@mui/material"
import styled from "styled-components"

import RTNewsCard from "../cards/RTNewsCard"
import RTCalendarCard from "../cards/RTCalendarCard"
import RTWeatherCard from "../cards/RTWeatherCard"
// import NearbyCrimesCard from "../cards/NearbyCrimesCard"
// import CruiseCard from "../cards/CruiseCard"
// import BusRoutesCard from "../cards/BusRoutesCard"
// import SeismicDesignCard from "../cards/SeismicDesignCard"

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
const HomePage = () => {
  return (
    <div>
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

export default memo(HomePage)
