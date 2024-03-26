import React, { useState, useEffect, memo } from "react"
import axios from "axios"
import TransportAgenciesTable from "../components/TransportAgenciesTable"
import TransportRouteSelectionPanel from "../components/TransportRouteSelectionPanel"
import TransportRoutesMap from "../components/TransportRoutesMap"
import { Autocomplete, TextField } from "@mui/material"
import {
  getAllAgenciesFrontEnd,
  getRoutesForSingleAgencyFrontEnd,
  getShapesForSingleRouteFrontEnd,
  getStopsForSingleRouteFrontEnd,
} from "../functionHandlers/loadStaticGTFSDataHandler"
import "../styles/transportroutes.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const TransportRoutesPage = () => {
  const [transportAgencyArray, setTransportAgencyArray] = useState([])
  const [value, setValue] = useState("")
  const [transportAgencyId, setTransportAgencyId] = useState("")
  const [transportAgencyName, setTransportAgencyName] = useState("")
  const [transportRoutesCollection, setTransportRoutesCollection] = useState([])
  const [transportRouteId, setTransportRouteId] = useState("")
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
      .then((data) => {
        data.forEach(function (data) {
          data["id"] = data["agency_id"]
          data["label"] = data["agency_name"]
          delete data["agency_id"]
          delete data["agency_name"]
        })

        setTransportAgencyArray(data)
        setTransportAgencyId(data[0].id)
        setTransportAgencyName(data[0].label)
        setValue(data[0].id)
        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  // if (transportAgencyArray.length > 0) {
  //   console.log(transportAgencyArray)
  // }

  useEffect(() => {
    setIsLoading(true)
    if (transportAgencyArray.length > 0) {
      const routesDataUrl = routesDataBaseUrl + transportAgencyId
      getRoutesForSingleAgencyFrontEnd(routesDataUrl, transportAgencyId)
        .then((returnedData) => {
          setTransportRoutesCollection(returnedData)
          setTransportRouteId(returnedData[6].route_id)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [transportAgencyId])

  useEffect(() => {
    setIsLoading(true)
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
  }, [transportRoutesCollection])

  useEffect(() => {
    setIsLoading(true)
    if (transportRoutesCollection.length > 0) {
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

  console.log(value.id)

  return (
    <div className="transportroutescontainer">
      <div className="transportroutestablescontainer">
        <div className="transportroutestables2container">
          <div className="transportagenciestablecontainer">
            <Autocomplete
              // onChange={(_, agency_id) =>
              //   getRoutesForSingleAgencyFrontEnd(agency_id)
              // }
              disablePortal
              onChange={(event, newValue) => {
                setValue(newValue)
              }}
              options={transportAgencyArray}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Agency" />}
            />

            {/* <TransportAgenciesTable
              transportAgencyArray={transportAgencyArray}
            />
          </div>
          <div className="transportroutesroutescontainer">
            <TransportRouteSelectionPanel
              transportRoutesCollection={transportRoutesCollection}
            /> */}
          </div>
        </div>
      </div>
      <div className="transportroutesmapcontainer">
        <TransportRoutesMap
          isLoading={isLoading}
          transportAgencyName={transportAgencyName}
          transportShapesCollection={transportShapesCollection}
          transportRoutesCollection={transportRoutesCollection}
          transportStopsCollection={transportStopsCollection}
        />
      </div>
    </div>
  )
}

export default memo(TransportRoutesPage)
