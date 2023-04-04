import React, { useState, useEffect, memo } from "react"
import styled from "styled-components"

import BusRouteSelectionPanel from "../components/BusRouteSelectionPanel"
import BusRoutesMap from "../components/BusRoutesMap"
import {
  getAgencyName,
  getAllStops,
  getAllShapes,
  getAllRoutes,
  // getDisplayData,
} from "../functionHandlers/loadBusTransportDataHandler"

const BusRoutesContainer = styled.div`
  display: flex;
`

const BusRoutesTableContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 500px;
`

const BusRoutesMapContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 800px;
`

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const BusRoutesPage = () => {
  const [busAgencyName, setBusAgencyName] = useState()
  const [busShapesCollection, setBusShapesCollection] = useState([])
  const [busStopsCollection, setBusStopsCollection] = useState([])
  const [busRoutesCollection, setBusRoutesCollection] = useState([])
  // const [displayBusRoutesCollection, setDisplayBusRoutesCollection] = useState(
  //   []
  // )
  const [isLoading, setIsLoading] = useState(true)

  const saveToHooks = (array) => {
    setBusRoutesCollection(array)
    // setDisplayBusRoutesCollection(getDisplayData(array[0]))
  }

  useEffect(() => {
    getAgencyName()
      .then((returnedData) => {
        setBusAgencyName(returnedData[0].agency_name)
      })
      .catch((err) => {
        console.log(err)
      })

    // This function does some reduction & reformatting
    getAllShapes()
      .then((returnedData) => {
        setBusShapesCollection(returnedData)
      })
      .catch((err) => {
        console.log(err)
      })

    getAllStops()
      .then((returnedData) => {
        setBusStopsCollection(returnedData)
      })
      .catch((err) => {
        console.log(err)
      })

    getAllRoutes()
      .then((returnedData) => {
        saveToHooks(returnedData)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <BusRoutesContainer>
      <BusRoutesTableContainer>
        <BusRouteSelectionPanel busRoutesCollection={busRoutesCollection} />
      </BusRoutesTableContainer>
      <BusRoutesMapContainer>
        <BusRoutesMap
          isLoading={isLoading}
          busAgencyName={busAgencyName}
          busShapesCollection={busShapesCollection}
          busStopsCollection={busStopsCollection}
          busRoutesCollection={busRoutesCollection}
          // displayBusRoutesCollection={displayBusRoutesCollection}
        />
      </BusRoutesMapContainer>
    </BusRoutesContainer>
  )
}

export default memo(BusRoutesPage)
