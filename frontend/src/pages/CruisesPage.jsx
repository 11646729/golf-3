import React, { useState, useEffect, memo } from "react"
import CruisesTable from "../components/CruisesTable"
import CruisesMap from "../components/CruisesMap"
import { getPortArrivalsData } from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import { getLiveVesselPositions } from "../functionHandlers/getLiveVesselPositions"
import "../styles/cruises.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const CruisesPage = () => {
  const [portArrivals, setPortArrivals] = useState([])
  const [vesselPositions, setVesselPositions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const homePosition = {
    lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
    lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
  }

  // build portArrivalsData Url
  const portArrivalsDataUrl = "http://localhost:4000/api/cruise/getPortArrivals"

  // This routine gets Port Arrivals data
  useEffect(() => {
    getPortArrivalsData(portArrivalsDataUrl)
      .then((returnedData) => {
        // Sort by date & time because returnedData is not always in timestamp order
        returnedData.data.sort((a, b) => (a.vesseleta > b.vesseleta ? 1 : -1))

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
      getLiveVesselPositions(portArrivals)
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
    <div className="cruisescontainer">
      <div className="cruisestablecontainer">
        <CruisesTable portArrivals={portArrivals} />
      </div>
      <div className="cruisesmapcontainer">
        <CruisesMap
          // isLoading={isLoading}
          cruisesHomePosition={homePosition}
          vesselPositions={vesselPositions}
          // vesselDetails={portArrivals}
        />
      </div>
    </div>
  )
}

export default memo(CruisesPage)
