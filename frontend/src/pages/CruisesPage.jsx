import { useState, useEffect, useCallback } from "react"
import socketIOClient from "socket.io-client"
import CruisesTable from "../components/CruisesTable"
import CruisesMap from "../components/CruisesMap"
import CruisesImportButton from "../components/CruisesImportButton"
import {
  importBelfastScheduleHandler,
  getBelfastImportStatus,
  getBelfastScheduleData,
  getVesselPositionsData,
} from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import "../styles/cruises.scss"

const POSITION_POLL_INTERVAL_MS = 30_000

const vesselKey = (vesselname) => (vesselname ?? "").trim().toUpperCase()

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

  // -------------------------------------------------------
  // This is a React useEffect hook that runs once when the
  // component first mounts. It calls loadScheduleData(),
  // which fetches the Belfast cruise schedule / port arrivals data
  // from the server (via getBelfastScheduleData()),
  // populates the portArrivals state, and computes the most
  // recent PDF modification date to set lastBelfastImportDate.
  // Then it calls loadVesselPositions() to fetch the current vessel positions,
  // and sets up a polling interval to refresh the vessel positions every 30 seconds.
  // Finally, it sets up a WebSocket connection to listen for real-time updates
  // to vessel positions, and updates the vesselPositions state accordingly.
  // -------------------------------------------------------
  useEffect(() => {
    loadScheduleData()
  }, [])

  const loadVesselPositions = useCallback(() => {
    getVesselPositionsData()
      .then((returnedData) => setVesselPositions(returnedData.data ?? []))
      .catch((err) => console.error("Vessel positions fetch failed:", err))
  }, [])

  useEffect(() => {
    loadVesselPositions()
    const interval = setInterval(loadVesselPositions, POSITION_POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [loadVesselPositions])

  useEffect(() => {
    const socket = socketIOClient(
      import.meta.env.VITE_EXPRESS_SERVER_ENDPOINT_URL,
      {
        autoConnect: false,
      },
    )
    socket.connect()

    socket.on("vesselPositionUpdated", (position) => {
      setVesselPositions((prev) => {
        // Keyed by vessel name — CruiseMapper positions have no MMSI, so every
        // vessel still awaiting its lookup would collide on mmsi = 0.
        const idx = prev.findIndex(
          (p) => vesselKey(p.vesselname) === vesselKey(position.vesselname),
        )
        if (idx === -1) return [...prev, position]
        const next = [...prev]
        next[idx] = position
        return next
      })
    })

    return () => socket.disconnect()
  }, [])

  // -------------------------------------------------------
  // This is a function that imports the Belfast vessel schedule if the import button is clicked.
  // It sets the belfastFetchStatus to "loading", calls importBelfastScheduleHandler(),
  // and then polls the import status using getBelfastImportStatus(). If the import is successful,
  // it updates the lastBelfastImportDate and sets the belfastFetchStatus to "complete".
  // If there is an error, it sets the belfastErrorMessage and belfastFetchStatus to "error".
  // -------------------------------------------------------
  const handleBelfastFetch = async () => {
    setBelfastFetchStatus("loading")
    setBelfastErrorMessage(null)
    try {
      await importBelfastScheduleHandler()
      const { promise } = getBelfastImportStatus(() => {})
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
            portArrivals={portArrivals}
            vesselPositions={vesselPositions}
          />
        </div>
      </div>
    </div>
  )
}

export default CruisesPage
