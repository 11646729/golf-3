import React, { useState, useEffect, memo } from "react"
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
  const [transportAgencyId, setTransportAgencyId] = useState("")
  const [transportAgencyName, setTransportAgencyName] = useState("")
  const [transportRoutesArray, setTransportRoutesArray] = useState([])
  const [transportRouteId, setTransportRouteId] = useState("")
  const [transportShapesArray, setTransportShapesArray] = useState([])
  const [transportStopsArray, setTransportStopsArray] = useState([])
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
        // console.log(data)
        setTransportAgencyArray(data)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const shapesDataUrl = shapesDataBaseUrl + transportRouteId
    getShapesForSingleRouteFrontEnd(
      shapesDataUrl,
      transportRouteId,
      transportRoutesArray
    )
      .then((returnedData) => {
        setTransportShapesArray(returnedData)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [transportRoutesArray])

  useEffect(() => {
    setIsLoading(true)
    if (transportRoutesArray.length > 0) {
      const stopsDataUrl = stopsDataBaseUrl + transportRouteId
      getStopsForSingleRouteFrontEnd(
        stopsDataUrl,
        transportRouteId,
        transportRoutesArray
      )
        .then((returnedData) => {
          setTransportStopsArray(returnedData)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [transportRoutesArray])

  return (
    <div className="transportroutescontainer">
      <div className="transportroutestablescontainer">
        <div className="transportroutestables2container">
          <div className="transportagenciestablecontainer">
            <Autocomplete
              disablePortal
              onChange={(event, newValue) => {
                setTransportAgencyId(newValue.agencyid)
                // setTransportAgencyName(newValue.label)

                const routesDataUrl = routesDataBaseUrl + newValue.agencyid
                getRoutesForSingleAgencyFrontEnd(
                  routesDataUrl,
                  transportAgencyId
                ).then((returnedData) => {
                  setTransportRoutesArray(returnedData)
                })
              }}
              options={transportAgencyArray}
              sx={{ width: 300, color: "white" }}
              renderInput={(params) => <TextField {...params} label="Agency" />}
            />

            <Autocomplete
              disabled={!transportAgencyId}
              onChange={(event, newValue) => {
                console.log(transportRoutesArray[0].routeid)

                const shapesDataUrl = shapesDataBaseUrl + transportRouteId
                getShapesForSingleRouteFrontEnd(
                  shapesDataUrl,
                  transportRouteId,
                  transportRoutesArray
                ).then((returnedData) => {
                  setTransportShapesArray(returnedData)
                })
              }}
              options={transportRoutesArray}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Routes" />}
            />

            {/* <TransportAgenciesTable
              transportAgencyArray={transportAgencyArray}
            />
          </div>
          <div className="transportroutesroutescontainer">
            <TransportRouteSelectionPanel
              transportRoutesArray={transportRoutesArray}
            /> */}
          </div>
        </div>
      </div>
      <div className="transportroutesmapcontainer">
        <TransportRoutesMap
          isLoading={isLoading}
          transportAgencyName={transportAgencyName}
          transportRoutesArray={transportRoutesArray}
          transportShapesArray={transportShapesArray}
          transportStopsArray={transportStopsArray}
        />
      </div>
    </div>
  )
}

export default memo(TransportRoutesPage)
