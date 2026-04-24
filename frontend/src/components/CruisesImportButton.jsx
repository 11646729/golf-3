import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"

const PHASE_LABELS = {
  fetching_schedule: "Fetching cruise schedule…",
  scraping_arrivals: "Scraping arrival records…",
}

const buttonLabel = {
  idle: "Update Database",
  loading: "Fetching Data…",
  complete: "Database Updated",
  error: "Update Failed – Retry",
}

const buttonBg = {
  loading: "#c62828",
  complete: "#2e7d32",
  error: "#e65100",
}

const CruisesImportButton = ({ fetchStatus, jobProgress, lastPositionDate, onFetch }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const downloadedBeforeToday = !lastPositionDate || lastPositionDate < today

  const lastPositionFormatted = lastPositionDate
    ? lastPositionDate.toLocaleDateString("en-GB")
    : null

  const progressValue =
    jobProgress?.phase === "scraping_vessels" && jobProgress.totalVessels > 0
      ? Math.round((jobProgress.vesselsScraped / jobProgress.totalVessels) * 100)
      : null

  const progressLabel =
    jobProgress?.phase === "scraping_vessels"
      ? `Scraping vessel ${jobProgress.vesselsScraped} of ${jobProgress.totalVessels}…`
      : PHASE_LABELS[jobProgress?.phase] ?? "Fetching cruise ship arrivals…"

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mx: 2.5, my: 1.5 }}>
        <Button
          variant="contained"
          disabled={fetchStatus === "loading" || !downloadedBeforeToday}
          onClick={onFetch}
          sx={{
            textTransform: "capitalize",
            minWidth: 180,
            backgroundColor: buttonBg[fetchStatus],
            color: "white",
            "&:hover": { backgroundColor: buttonBg[fetchStatus] ?? undefined },
            "&.Mui-disabled": { color: "white" },
          }}
        >
          {buttonLabel[fetchStatus]}
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
    </>
  )
}

export default CruisesImportButton
