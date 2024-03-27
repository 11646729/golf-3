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
        data.forEach((data) => {
          data["agencyid"] = data["agency_id"]
          data["label"] = data["agency_name"]
          delete data["agency_id"]
          delete data["agency_name"]
        })

        setTransportAgencyArray(data)
        setTransportAgencyId(data[0].agencyid)
        setTransportAgencyName(data[0].label)

        setIsLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    setIsLoading(true)
    if (transportAgencyArray.length > 0) {
      const routesDataUrl = routesDataBaseUrl + transportAgencyId
      getRoutesForSingleAgencyFrontEnd(routesDataUrl, transportAgencyId)
        .then((data) => {
          data.forEach((data) => {
            data["routeid"] = data["route_id"]
            data["agencyid"] = data["agency_id"]
            data["label"] = data["route_short_name"]
            data["routelongname"] = data["route_long_name"]
            delete data["route_id"]
            delete data["agency_id"]
            delete data["route_short_name"]
            delete data["route_long_name"]
          })

          setTransportRoutesArray(data)
          // setTransportRouteId(returnedData[6].route_id)
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
      transportRoutesArray
    )
      .then((returnedData) => {
        setTransportShapesCollection(returnedData)
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
          setTransportStopsCollection(returnedData)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [transportRoutesArray])

  console.log(transportAgencyId)
  console.log(transportRoutesArray)

  return (
    <div className="transportroutescontainer">
      <div className="transportroutestablescontainer">
        <div className="transportroutestables2container">
          <div className="transportagenciestablecontainer">
            <Autocomplete
              disablePortal
              onChange={(event, newValue) => {
                setTransportAgencyId(newValue.agencyid)
                // getRoutesForSingleAgencyFrontEnd(transportAgencyId)
              }}
              options={transportAgencyArray}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label="Agency" />}
            />

            <Autocomplete
              disabled={!transportAgencyId}
              onChange={(event, newValue) => {
                console.log(transportRoutesArray[0].routeid)
                // setTransportAgencyId(newValue.id)
                // getRoutesForSingleAgencyFrontEnd(transportAgencyId)
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
          transportShapesCollection={transportShapesCollection}
          transportRoutesArray={transportRoutesArray}
          transportStopsCollection={transportStopsCollection}
        />
      </div>
    </div>
  )
}

export default memo(TransportRoutesPage)
