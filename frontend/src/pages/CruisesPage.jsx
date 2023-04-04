import React, { useState, useEffect, memo } from "react"
import styled from "styled-components"

import CruisesTable from "../components/CruisesTable"
import CruisesMap from "../components/CruisesMap"
import {
  getPortArrivalsData,
  getCruiseVesselPositionData,
} from "../functionHandlers/loadCruiseShipArrivalsDataHandler"

const CruisesContainer = styled.div`
  display: flex;
`

const CruisesTableContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 500px;
`

const CruisesMapContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 500px;
`

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const CruisesPage = () => {
  const [portArrivals, setPortArrivals] = useState([])
  const [vesselPositions, setVesselPositions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const homePosition = {
    lat: parseFloat(process.env.REACT_APP_HOME_LATITUDE),
    lng: parseFloat(process.env.REACT_APP_HOME_LONGITUDE),
  }

  // build portArrivalsData Url
  const portArrivalsDataUrl = "http://localhost:4000/api/cruise/portArrivals"

  // This routine gets Port Arrivals data
  useEffect(() => {
    getPortArrivalsData(portArrivalsDataUrl)
      .then((returnedData) => {
        // Sort by date becaause returnedData is not always in timestamp order
        // returnedData.sort((a, b) => (a.vesseleta > b.vesseleta ? 1 : -1))

        setPortArrivals(returnedData.data)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // This routine gets Cruise Vessel position data - after portArrivals array has been filled
  useEffect(() => {
    setIsLoading(true)

    if (portArrivals.length !== 0) {
      getCruiseVesselPositionData(portArrivals)
        .then((returnedData) => {
          setVesselPositions(returnedData)

          setIsLoading(false)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [portArrivals])

  return (
    <CruisesContainer>
      <CruisesTableContainer>
        <CruisesTable portArrivals={portArrivals} />
      </CruisesTableContainer>
      <CruisesMapContainer>
        <CruisesMap
          isLoading={isLoading}
          cruisesHomePosition={homePosition}
          vesselPositions={vesselPositions}
          vesselDetails={portArrivals}
        />
      </CruisesMapContainer>
    </CruisesContainer>
  )
}

export default memo(CruisesPage)
