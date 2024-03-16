import React, { useState, useEffect, memo } from "react"
import styled from "styled-components"

// import TransportRouteSelectionPanel from "../components/TransportRouteSelectionPanel"
import TransportRoutesMap from "../components/TransportRoutesMap"
import {
  getAllAgenciesFrontEnd,
  getRoutesForSingleAgencyFrontEnd,
  getShapesForSingleRouteFrontEnd,
  getStopsForSingleRouteFrontEnd,
} from "../functionHandlers/loadStaticGTFSDataHandler"

const TransportRoutesContainer = styled.div`
  display: flex;
`

const TransportRoutesTableContainer = styled.div`
  flex: 2;
  -webkit-box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  min-height: 500px;
`

const TransportRoutesMapContainer = styled.div`
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
  const [transportAgencyCollection, setTransportAgencyCollection] = useState([])
  const [transportRoutesCollection, setTransportRoutesCollection] = useState([])
  const [transportShapesCollection, setTransportShapesCollection] = useState([])
  const [transportStopsCollection, setTransportStopsCollection] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // build agenciesData Url
  const transportAgenciesDataUrl =
    "http://localhost:4000/api/gtfs/transportagencies"
  const routesDataBaseUrl =
    "http://localhost:4000/api/gtfs/routesforsingleagency?transportAgencyId="
  const shapesDataBaseUrl =
    "http://localhost:4000/api/gtfs/shapesforsingleroute?routeId="
  const stopsDataBaseUrl =
    "http://localhost:4000/api/gtfs/stopsforsingleroute?routeId="

  useEffect(() => {
    getAllAgenciesFrontEnd(transportAgenciesDataUrl)
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
    if (transportAgencyId != null) {
      const routesDataUrl = routesDataBaseUrl + transportAgencyId
      getRoutesForSingleAgencyFrontEnd(routesDataUrl, transportAgencyId)
        .then((returnedData) => {
          setTransportRoutesCollection(returnedData)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [transportAgencyId])

  useEffect(() => {
    setIsLoading(true)
    if (transportRoutesCollection.length > 0) {
      let transportRouteId = transportRoutesCollection[6].route_id // transportRoutesCollection[0] does not give shapes for a route
      const shapesDataUrl = shapesDataBaseUrl + transportRouteId
      getShapesForSingleRouteFrontEnd(
        shapesDataUrl,
        transportRouteId,
        transportRoutesCollection
      )
        .then((returnedData) => {
          setTransportShapesCollection(returnedData)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [transportRoutesCollection])

  useEffect(() => {
    setIsLoading(true)
    if (transportRoutesCollection.length > 0) {
      let transportRouteId = transportRoutesCollection[6].route_id // transportRoutesCollection[0] does not give shapes for a route
      const stopsDataUrl = stopsDataBaseUrl + transportRouteId
      getStopsForSingleRouteFrontEnd(
        stopsDataUrl,
        transportRouteId,
        transportRoutesCollection
      )
        .then((returnedData) => {
          setTransportStopsCollection(returnedData)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [transportRoutesCollection])

  return (
    <TransportRoutesContainer>
      <TransportRoutesTableContainer>
        {/* <TransportRouteSelectionPanel busRoutesCollection={busRoutesCollection} /> */}
      </TransportRoutesTableContainer>
      <TransportRoutesMapContainer>
        <TransportRoutesMap
          isLoading={isLoading}
          busAgencyName={transportAgencyName}
          busShapesCollection={transportShapesCollection}
          busRoutesCollection={transportRoutesCollection}
          busStopsCollection={transportStopsCollection}
        />
      </TransportRoutesMapContainer>
    </TransportRoutesContainer>
  )
}

export default memo(TransportRoutesPage)
