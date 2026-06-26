import { useState, useEffect, useCallback } from "react"
import socketIOClient from "socket.io-client"
import CruisesTable from "../components/CruisesTable"
import CruisesMap from "../components/CruisesMap"
import CruisesImportButton from "../components/CruisesImportButton"
import {
  importBelfastScheduleHandler,
  pollBelfastImportStatus,
  getBelfastScheduleData,
  getVesselPositionsData,
} from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import "../styles/cruises.scss"

const POSITION_POLL_INTERVAL_MS = 30_000

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const CruisesPage = () => {
  const [portArrivals, setPortArrivals] = useState([])
  const [vesselPositions, setVesselPositions] = useState([])
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

  const loadVesselPositions = useCallback(() => {
    getVesselPositionsData()
      .then((returnedData) => setVesselPositions(returnedData.data ?? []))
      .catch((err) => console.error("Vessel positions fetch failed:", err))
  }, [])

  useEffect(() => {
    loadScheduleData()
  }, [])

  useEffect(() => {
    loadVesselPositions()
    const interval = setInterval(loadVesselPositions, POSITION_POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [loadVesselPositions])

  useEffect(() => {
    const socket = socketIOClient(import.meta.env.VITE_EXPRESS_SERVER_ENDPOINT_URL, {
      autoConnect: false,
    })
    socket.connect()

    socket.on("vesselPositionUpdated", (position) => {
      setVesselPositions((prev) => {
        const idx = prev.findIndex((p) => Number(p.mmsi) === Number(position.mmsi))
        if (idx === -1) return [...prev, position]
        const next = [...prev]
        next[idx] = position
        return next
      })
    })

    return () => socket.disconnect()
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
          <CruisesTable
            portArrivals={portArrivals}
            vesselPositions={vesselPositions}
          />
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
