import React, { useState, memo } from "react"
import { Grid } from "@mui/material"
import RTNewsCard from "../cards/RTNewsCard"
import RTCalendarCard from "../cards/RTCalendarCard"
import RTWeatherCard from "../cards/RTWeatherCard"
import "../styles/realtimehome.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
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

      <div className="realtimehomecontainer">
        <div className="realtimecardcontainer">
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
        </div>
      </div>
    </div>
  )
}

export default memo(RealTimeHomePage)
