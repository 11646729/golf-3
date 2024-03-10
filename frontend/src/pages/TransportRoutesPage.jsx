import React, { useState, useEffect, memo } from "react"
import styled from "styled-components"

// import BusRouteSelectionPanel from "../components/BusRouteSelectionPanel"
import BusRoutesMap from "../components/BusRoutesMap"
import {
  getAllAgencyNames,
  getRoutesForSingleAgencyFrontEnd,
  getAllStops,
  getAllShapes,
  // getAllRoutes,
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

  // build agenciesData Url
  const agenciesDataUrl = "http://localhost:4000/api/gtfs/agencynames/"
  const routesDataUrl =
    "http://localhost:4000/api/gtfs/routesforsingleagency?transportAgencyId=7778021"

  useEffect(() => {
    getAllAgencyNames(agenciesDataUrl)
      .then((returnedData) => {
        setTransportAgencyId(returnedData[0].agency_id)
        setTransportAgencyName(returnedData[0].agency_name)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    setIsLoading(true)
    if (transportAgencyId >= null) {
      getRoutesForSingleAgencyFrontEnd(routesDataUrl, transportAgencyId)
        .then((returnedData) => {
          setTransportRoutesCollection(returnedData)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [transportAgencyId])

  if (transportRoutesCollection.length > 0)
    console.log(transportRoutesCollection)

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
