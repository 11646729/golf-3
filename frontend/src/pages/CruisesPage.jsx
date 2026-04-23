import { useState, useEffect, useRef } from "react"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import CruisesTable from "../components/CruisesTable"
import CruisesMap from "../components/CruisesMap"
import {
  getPortArrivalsData,
  loadCruiseShipArrivalsDataHandler,
  pollImportStatus,
} from "../functionHandlers/loadCruiseShipArrivalsDataHandler"
import { getLiveVesselPositions } from "../functionHandlers/getLiveVesselPositions"
import "../styles/cruises.scss"

const PHASE_LABELS = {
  fetching_schedule: "Fetching cruise schedule…",
  scraping_arrivals: "Scraping arrival records…",
}

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const CruisesPage = () => {
  const [portArrivals, setPortArrivals] = useState([])
  const [vesselPositions, setVesselPositions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchStatus, setFetchStatus] = useState("idle") // "idle" | "loading" | "complete" | "error"
  const [jobProgress, setJobProgress] = useState(null)   // raw status object from backend
  const pollingCancelRef = useRef(null)

  // Cancel any in-flight polling when the component unmounts
  useEffect(() => () => pollingCancelRef.current?.(), [])

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

  const handleFetchData = async () => {
    setFetchStatus("loading")
    setJobProgress(null)
    try {
      await loadCruiseShipArrivalsDataHandler()

      const { promise, cancel } = pollImportStatus(setJobProgress)
      pollingCancelRef.current = cancel
      await promise

      setFetchStatus("complete")
    } catch (err) {
      console.error(err)
      setFetchStatus("error")
    }
  }

  // Derive progress bar value (null → indeterminate, 0-100 → determinate)
  const progressValue =
    jobProgress?.phase === "scraping_vessels" && jobProgress.totalVessels > 0
      ? Math.round((jobProgress.vesselsScraped / jobProgress.totalVessels) * 100)
      : null

  const progressLabel =
    jobProgress?.phase === "scraping_vessels"
      ? `Scraping vessel ${jobProgress.vesselsScraped} of ${jobProgress.totalVessels}…`
      : PHASE_LABELS[jobProgress?.phase] ?? "Fetching cruise ship arrivals…"

  const buttonLabel = {
    idle: "Update Database",
    loading: "Fetching Data…",
    complete: "Database Updated",
    error: "Update Failed – Retry",
  }[fetchStatus]

  const buttonBg = {
    loading: "#c62828",
    complete: "#2e7d32",
    error: "#e65100",
  }[fetchStatus]

  const lastPositionDate = (() => {
    const raw = vesselPositions.find((v) => v?.timestamp)?.timestamp
    if (!raw || raw === "Not Known") return null
    const d = new Date(raw)
    return isNaN(d.getTime()) ? null : d
  })()

  const lastPositionFormatted = lastPositionDate
    ? lastPositionDate.toLocaleDateString("en-GB")
    : null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const downloadedBeforeToday = !lastPositionDate || lastPositionDate < today

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mx: 2.5, my: 1.5 }}>
        <Button
          variant="contained"
          disabled={fetchStatus === "loading" || !downloadedBeforeToday}
          onClick={handleFetchData}
          sx={{
            textTransform: "capitalize",
            minWidth: 180,
            backgroundColor: buttonBg,
            color: "white",
            "&:hover": { backgroundColor: buttonBg ?? undefined },
            "&.Mui-disabled": { color: "white" },
          }}
        >
          {buttonLabel}
        </Button>
        {fetchStatus === "loading" && (
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "white" }}>
              {progressLabel}
            </Typography>
            <LinearProgress
              variant={progressValue !== null ? "determinate" : "indeterminate"}
              value={progressValue ?? undefined}
            />
          </Box>
        )}
      </Box>
      {lastPositionFormatted && (
        <Typography variant="caption" sx={{ mx: 2.5, display: "block" }}>
          Last date: {lastPositionFormatted}
        </Typography>
      )}
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
