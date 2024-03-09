import React, { useState, useEffect, memo } from "react"
import styled from "styled-components"

// import BusRouteSelectionPanel from "../components/BusRouteSelectionPanel"
import BusRoutesMap from "../components/BusRoutesMap"
import {
  getAllAgencyNames,
  getRoutesForSingleAgency,
  getAllStops,
  getAllShapes,
  getAllRoutes,
  // getDisplayData,
} from "../functionHandlers/loadStaticGTFSDataHandler"

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
const TransportRoutesPage = () => {
  const [transportAgencyId, setTransportAgencyId] = useState()
  const [transportAgencyName, setTransportAgencyName] = useState()
  const [transportRoutesCollection, setTransportRoutesCollection] = useState([])
  const [busShapesCollection, setBusShapesCollection] = useState([])
  const [busStopsCollection, setBusStopsCollection] = useState([])
  // const [displayBusRoutesCollection, setDisplayBusRoutesCollection] = useState(
  //   []
  // )
  const [isLoading, setIsLoading] = useState(true)

  // const saveToHooks = (array) => {
  //   setBusRoutesCollection(array)
  //   // setDisplayBusRoutesCollection(getDisplayData(array[0]))
  // }

  useEffect(() => {
    getAllAgencyNames()
      .then((returnedData) => {
        setTransportAgencyId(returnedData[0].agency_id)
        setTransportAgencyName(returnedData[0].agency_name)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // results.length shows 1 if exists or 0 if doesn't exist

  useEffect(() => {
    setIsLoading(true)
    if (transportAgencyId >= null) {
      console.log(transportAgencyId)
      console.log(transportAgencyName)

      // getRoutesForSingleAgency(transportAgencyId)
      //   .then((returnedData) => {
      //     console.log(returnedData)
      //     // setBusShapesCollection(returnedData)
      //   })
      //   .catch((err) => {
      //     console.log(err)
      //   })
    }
  }, [transportAgencyId])

  // // This function does some reduction & reformatting
  // getAllShapes()
  //   .then((returnedData) => {
  //     setBusShapesCollection(returnedData)
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })

  // getAllStops()
  //   .then((returnedData) => {
  //     setBusStopsCollection(returnedData)
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })

  // getAllRoutes()
  //   .then((returnedData) => {
  //     saveToHooks(returnedData)

  //     setIsLoading(false)
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })
  // }, [])

  return (
    <BusRoutesContainer>
      <BusRoutesTableContainer>
        {/* <BusRouteSelectionPanel busRoutesCollection={busRoutesCollection} /> */}
      </BusRoutesTableContainer>
      <BusRoutesMapContainer>
        <BusRoutesMap
          isLoading={isLoading}
          busAgencyName={transportAgencyName}
          busShapesCollection={busShapesCollection}
          busStopsCollection={busStopsCollection}
          busRoutesCollection={transportRoutesCollection}
          // displayBusRoutesCollection={displayBusRoutesCollection}
        />
      </BusRoutesMapContainer>
    </BusRoutesContainer>
  )
}

export default memo(TransportRoutesPage)
