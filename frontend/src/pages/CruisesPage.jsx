import { useState, useEffect /*, useRef*/ } from "react"
import CruisesTable from "../components/CruisesTable"
import CruisesMap from "../components/CruisesMap"
import CruisesImportButton from "../components/CruisesImportButton"
import {
  importBelfastScheduleHandler,
  getBelfastScheduleData,
} from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import "../styles/cruises.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const CruisesPage = () => {
  const [portArrivals, setPortArrivals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [belfastFetchStatus, setBelfastFetchStatus] = useState("idle") // "idle" | "loading" | "complete" | "error"
  const [lastBelfastImportDate, setLastBelfastImportDate] = useState(null)

  const loadScheduleData = () => {
    getBelfastScheduleData()
      .then((returnedData) => {
        const data = returnedData.data ?? []
        setPortArrivals(data)
        setIsLoading(false)

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
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadScheduleData()
  }, [])

  const handleBelfastFetch = async () => {
    setBelfastFetchStatus("loading")
    try {
      const result = await importBelfastScheduleHandler()
      if (result.modDate) {
        setLastBelfastImportDate(new Date(result.modDate))
      }
      setBelfastFetchStatus("complete")
      loadScheduleData()
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
            vesselPositions={[]}
            vesselDetails={portArrivals}
          />
        </div>
      </div>
    </div>
  )
}

export default CruisesPage
