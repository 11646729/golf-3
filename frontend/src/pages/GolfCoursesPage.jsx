import { useState, useEffect } from "react"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import GolfCoursesTable from "../components/GolfCoursesTable"
import GolfCoursesMap from "../components/GolfCoursesMap"
import {
  getGolfCoursesData,
  loadGolfCoursesDataHandler,
  getGolfImportStatus,
} from "../functionHandlers/loadGolfCoursesDataHandler"
import "../styles/golfcourses.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const GolfCoursesPage = () => {
  const [golfcourses, setGolfCoursesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [fetchStatus, setFetchStatus] = useState("idle") // "idle" | "loading" | "complete" | "error"
  const [lastImportDate, setLastImportDate] = useState(null)

  useEffect(() => {
    getGolfCoursesData("http://localhost:4000/api/golf/getGolfCourses")
      .then((returnedData) => {
        setGolfCoursesData(returnedData)
        setLoadError(null)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error loading golf courses data:", err)
        setLoadError(err.message || "Failed to load golf courses")
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    getGolfImportStatus().then(({ lastUpdated }) => {
      if (lastUpdated) setLastImportDate(new Date(lastUpdated))
    })
  }, [])

  const handleFetchData = async () => {
    setFetchStatus("loading")
    try {
      await loadGolfCoursesDataHandler()
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
              Importing golf courses…
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </Box>
      {lastImportFormatted && (
        <Typography variant="caption" sx={{ mx: 2.5, display: "block" }}>
          Last date: {lastImportFormatted}
        </Typography>
      )}
      <div className="golfcoursescontainer">
        <div className="golfcoursestablecontainer">
          {loadError && (
            <div
              style={{
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#ffebee",
                border: "1px solid #f44336",
                borderRadius: "4px",
                color: "#c62828",
              }}
            >
              <strong>Error loading golf courses:</strong> {loadError}
            </div>
          )}
          <GolfCoursesTable golfcourses={golfcourses} />
        </div>
        <div className="golfcoursesmapcontainer">
          <GolfCoursesMap isLoading={isLoading} golfcourses={golfcourses} />
        </div>
      </div>
    </div>
  )
}

export default GolfCoursesPage
