import React, { useState, useEffect, memo } from "react"
import styled from "styled-components"

import NearbyCrimesInputPanel from "../components/NearbyCrimesInputPanel"
import NearbyCrimesMap from "../components/NearbyCrimesMap"
import { getCrimesData } from "../functionHandlers/loadCrimesDataHandler"

const NearbyCrimesContainer = styled.div`
  display: flex;
`

const NearbyCrimesInputPanelContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 150px;
`

const NearbyCrimesMapContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 800px;
`

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const NearbyCrimesPage = () => {
  const [rawCrimesData, setCrimesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Required for location of crimes data to fetch
  const mapCenter = {
    lat: parseFloat(process.env.REACT_APP_HOME_LATITUDE),
    lng: parseFloat(process.env.REACT_APP_HOME_LONGITUDE),
  }

  // Required output from DataPicker
  // const dateInfo = "&date=2022-06"

  // build Crimes Url - set dateInfo to "" to fetch most recent data
  // const crimesUrl = `${process.env.REACT_APP_CRIMES_ENDPOINT}?lat=${mapCenter.lat}&lng=${mapCenter.lng}${dateInfo}`
  const crimesUrl = `${process.env.REACT_APP_CRIMES_ENDPOINT}?lat=${mapCenter.lat}&lng=${mapCenter.lng}`

  // Download crimes data
  useEffect(() => {
    getCrimesData(crimesUrl)
      .then((returnedCrimesData) => {
        setCrimesData(returnedCrimesData)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [crimesUrl])

  return (
    <NearbyCrimesContainer>
      <NearbyCrimesInputPanelContainer>
        <NearbyCrimesInputPanel
          isLoading={isLoading}
          homeCheckboxStatus // Leaving it blank means true, "={false} otherwise"
          latestCheckboxStatus
        />
      </NearbyCrimesInputPanelContainer>
      <NearbyCrimesMapContainer>
        <NearbyCrimesMap crimesData={rawCrimesData} />
      </NearbyCrimesMapContainer>
    </NearbyCrimesContainer>
  )
}

export default memo(NearbyCrimesPage)
