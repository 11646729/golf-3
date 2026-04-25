import { memo, useState, useEffect } from "react"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import NearbyCrimesInputPanel from "../components/NearbyCrimesInputPanel"
import NearbyCrimesMap from "../components/NearbyCrimesMap"
import useNearbyCrimes from "../functionHandlers/useNearbyCrimes"
import {
  loadCrimesDataHandler,
  getCrimesImportStatus,
} from "../functionHandlers/loadCrimesDataHandler"
import "../styles/nearbycrimes.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const NearbyCrimesPage = () => {
  const lat = parseFloat(import.meta.env.VITE_HOME_LATITUDE)
  const lng = parseFloat(import.meta.env.VITE_HOME_LONGITUDE)

  const { crimes: rawCrimesData, isLoading } = useNearbyCrimes(
    lat,
    lng,
    "2025-02",
  ) // TODO: make the dates dynamic based on user input

  const [fetchStatus, setFetchStatus] = useState("idle") // "idle" | "loading" | "complete" | "error"
  const [lastImportDate, setLastImportDate] = useState(null)

  useEffect(() => {
    getCrimesImportStatus().then(({ lastUpdated }) => {
      if (lastUpdated) setLastImportDate(new Date(lastUpdated))
    })
  }, [])

  const handleFetchData = async () => {
    setFetchStatus("loading")
    try {
      await loadCrimesDataHandler()
      setLastImportDate(new Date())
      setFetchStatus("complete")
    } catch (err) {
      console.error(err)
      setFetchStatus("error")
    }
  }

  const lastImportFormatted = lastImportDate
    ? lastImportDate.toLocaleDateString("en-GB")
    : null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const downloadedBeforeToday = !lastImportDate || lastImportDate < today

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

  return (
    <div>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, mx: 2.5, my: 1.5 }}
      >
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
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "white" }}
            >
              Importing crimes data…
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </Box>
      {lastImportFormatted && (
        <Typography variant="caption" sx={{ mx: 2.5, display: "block" }}>
          Last date updated: {lastImportFormatted}
        </Typography>
      )}
      <div className="nearbycrimescontainer">
        <div className="nearbycrimesinputpanelcontainer">
          <NearbyCrimesInputPanel
            isLoading={isLoading}
            homeCheckboxStatus // Leaving it blank means true, "={false} otherwise"
            latestCheckboxStatus
          />
        </div>
        <div className="nearbycrimesmapcontainer">
          <NearbyCrimesMap crimesData={rawCrimesData} />
        </div>
      </div>
    </div>
  )
}

export default memo(NearbyCrimesPage)
