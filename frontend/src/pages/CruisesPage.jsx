import { useState, useEffect /*, useRef*/ } from "react"
import CruisesTable from "../components/CruisesTable"
import CruisesMap from "../components/CruisesMap"
import CruisesImportButton from "../components/CruisesImportButton"
import {
  importBelfastScheduleHandler,
  pollBelfastImportStatus,
  getBelfastScheduleData,
} from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import "../styles/cruises.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const CruisesPage = () => {
  const [portArrivals, setPortArrivals] = useState([])
  const [vesselPositions, setVesselPositions] = useState([])
  // TODO: after loadScheduleData resolves, fetch GET /api/cruise/vesselPositions
  //       with matched vesselnameurl values from portArrivals, then call setVesselPositions(data)
  const [belfastFetchStatus, setBelfastFetchStatus] = useState("idle") // "idle" | "loading" | "complete" | "error"
  const [belfastErrorMessage, setBelfastErrorMessage] = useState(null)
  const [lastBelfastImportDate, setLastBelfastImportDate] = useState(null)

  const loadScheduleData = () => {
    getBelfastScheduleData()
      .then((returnedData) => {
        const data = returnedData.data ?? []
        setPortArrivals(data)

        if (data.length > 0) {
          const maxModDate = data.reduce((max, row) => {
            if (!row.pdfmodifieddate) return max
            const date = new Date(row.pdfmodifieddate)
            return !max || date > max ? date : max
          }, null)
          setLastBelfastImportDate(maxModDate)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    loadScheduleData()
  }, [])

  const handleBelfastFetch = async () => {
    setBelfastFetchStatus("loading")
    setBelfastErrorMessage(null)
    try {
      await importBelfastScheduleHandler()
      const { promise } = pollBelfastImportStatus(() => {})
      const result = await promise
      if (result.modDate) {
        setLastBelfastImportDate(new Date(result.modDate))
      }
      setBelfastFetchStatus("complete")
      loadScheduleData()
    } catch (err) {
      console.error(err)
      setBelfastErrorMessage(err.message || "Import failed")
      setBelfastFetchStatus("error")
    }
  }

  return (
    <div>
      <CruisesImportButton
        belfastFetchStatus={belfastFetchStatus}
        belfastErrorMessage={belfastErrorMessage}
        lastBelfastImportDate={lastBelfastImportDate}
        onBelfastFetch={handleBelfastFetch}
      />
      <div className="cruisescontainer">
        <div className="cruisestablecontainer">
          <CruisesTable portArrivals={portArrivals} />
        </div>
        <div className="cruisesmapcontainer">
          <CruisesMap
            vesselPositions={vesselPositions}
            vesselDetails={portArrivals}
          />
        </div>
      </div>
    </div>
  )
}

export default CruisesPage
