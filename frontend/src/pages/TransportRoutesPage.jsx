import React, { useState, useEffect, memo } from "react"
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
        setTransportAgencyArray(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <div className="transportroutescontainer">
      <div className="transportroutestablescontainer">
        <div className="transportroutestables2container">
          <div className="transportagenciestablecontainer">
            <Autocomplete
              disablePortal
              onChange={(_, newValue) => {
                setTransportAgencyId(newValue.agencyid)
                setTransportAgencyName(newValue.label)
                getRoutesForSingleAgencyFrontEnd(
                  routesDataBaseUrl + newValue.agencyid,
                  transportAgencyId
                ).then((returnedData) => {
                  setTransportRoutesArray(returnedData)
                })
              }}
              options={transportAgencyArray}
              // renderOption={(props, option) => {
              //   return (
              //     <li {...props} key={option.agencyid}>
              //       {option.label}
              //     </li>
              //   )
              // }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ input: { color: "white" }, width: 580 }}
                  label="Agency"
                  // key={key}
                />
              )}
            />

            <Autocomplete
              disabled={!transportAgencyId}
              onChange={(_, newValue) => {
                getShapesForSingleRouteFrontEnd(
                  shapesDataBaseUrl + newValue.routeid,
                  newValue.routeid,
                  transportRoutesArray
                ).then((returnedData) => {
                  setTransportShapesArray(returnedData)
                })
                const stopsDataUrl = stopsDataBaseUrl + newValue.routeid
                getStopsForSingleRouteFrontEnd(
                  stopsDataUrl,
                  newValue.routeid,
                  transportRoutesArray
                ).then((returnedData) => {
                  setTransportStopsArray(returnedData)
                })
              }}
              options={transportRoutesArray}
              // renderOption={(props, option) => {
              //   return (
              //     <li {...props} key={option.routeid}>
              //       {option.label}
              //     </li>
              //   )
              // }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ input: { color: "white" }, width: 580 }}
                  label="Routes"
                  // key={key}
                />
              )}
            />
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
