import { useState, useEffect /*, useRef*/ } from "react"
import CruisesTable from "../components/CruisesTable"
import CruisesMap from "../components/CruisesMap"
import CruisesImportButton from "../components/CruisesImportButton"
import {
  getPortArrivalsData,
  importBelfastScheduleHandler,
  getBelfastScheduleData,
} from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import { getLiveVesselPositions } from "../functionHandlers/getLiveVesselPositions"
import "../styles/cruises.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const CruisesPage = () => {
  const [portArrivals, setPortArrivals] = useState([])
  const [vesselPositions, setVesselPositions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [belfastFetchStatus, setBelfastFetchStatus] = useState("idle") // "idle" | "loading" | "complete" | "error"
  const [lastBelfastImportDate, setLastBelfastImportDate] = useState(null)

  // This routine gets Port Arrivals data
  useEffect(() => {
    getPortArrivalsData("http://localhost:4000/api/cruise/getPortArrivals")
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

  // This routine gets Belfast Harbour schedule data and extracts the last import date
  useEffect(() => {
    getBelfastScheduleData()
      .then((returnedData) => {
        if (returnedData.data && returnedData.data.length > 0) {
          // Find the most recent pdfmodifieddate
          const maxModDate = returnedData.data.reduce((max, row) => {
            if (!row.pdfmodifieddate) return max
            const date = new Date(row.pdfmodifieddate)
            return !max || date > max ? date : max
          }, null)
          setLastBelfastImportDate(maxModDate)
        }
      })
      .catch((err) => {
        console.log("Error fetching Belfast schedule:", err)
      })
  }, [])

  const handleBelfastFetch = async () => {
    setBelfastFetchStatus("loading")
    try {
      const result = await importBelfastScheduleHandler()
      if (result.modDate) {
        setLastBelfastImportDate(new Date(result.modDate))
      }
      setBelfastFetchStatus("complete")
    } catch (err) {
      console.error(err)
      setBelfastFetchStatus("error")
    }
  }

  return (
    <div>
      <CruisesImportButton
        belfastFetchStatus={belfastFetchStatus}
        lastBelfastImportDate={lastBelfastImportDate}
        onBelfastFetch={handleBelfastFetch}
      />
      <div className="cruisescontainer">
        <div className="cruisestablecontainer">
          <CruisesTable portArrivals={portArrivals} />
        </div>
        <div className="cruisesmapcontainer">
          <CruisesMap
            isLoading={isLoading}
            vesselPositions={vesselPositions}
            vesselDetails={portArrivals}
          />
        </div>
      </div>
    </div>
  )
}

export default CruisesPage
