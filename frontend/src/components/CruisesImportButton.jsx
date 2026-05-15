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

const CruisesImportButton = ({
  fetchStatus,
  jobProgress,
  lastPositionDate,
  onFetch,
  belfastFetchStatus,
  lastBelfastImportDate,
  onBelfastFetch,
}) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const downloadedBeforeToday = !lastPositionDate || lastPositionDate < today

  const lastPositionFormatted = lastPositionDate
    ? lastPositionDate.toLocaleDateString("en-GB")
    : null

  const lastBelfastFormatted = lastBelfastImportDate
    ? lastBelfastImportDate.toLocaleDateString("en-GB")
    : null

  const progressValue =
    jobProgress?.phase === "scraping_vessels" && jobProgress.totalVessels > 0
      ? Math.round(
          (jobProgress.vesselsScraped / jobProgress.totalVessels) * 100,
        )
      : null

  const progressLabel =
    jobProgress?.phase === "scraping_vessels"
      ? `Scraping vessel ${jobProgress.vesselsScraped} of ${jobProgress.totalVessels}…`
      : (PHASE_LABELS[jobProgress?.phase] ?? "Fetching cruise ship arrivals…")

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, mx: 2.5, my: 1.5 }}
      >
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
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "white" }}
            >
              {progressLabel}
            </Typography>
            <LinearProgress
              variant={progressValue !== null ? "determinate" : "indeterminate"}
              value={progressValue ?? undefined}
            />
          </Box>
        )}
      </Box>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, mx: 2.5, my: 1.5 }}
      >
        <Button
          variant="contained"
          disabled={belfastFetchStatus === "loading" || belfastFetchStatus === "complete"}
          onClick={onBelfastFetch}
          sx={{
            textTransform: "capitalize",
            minWidth: 200,
            backgroundColor: belfastFetchStatus === "complete" ? "#000000" : buttonBg[belfastFetchStatus],
            color: "white",
            "&:hover": {
              backgroundColor: belfastFetchStatus === "complete" ? "#000000" : (buttonBg[belfastFetchStatus] ?? undefined),
            },
            "&.Mui-disabled": { color: "#9e9e9e", backgroundColor: "#000000" },
          }}
        >
          {belfastFetchStatus === "idle"
            ? "Belfast Schedule"
            : belfastFetchStatus === "loading"
              ? "Importing…"
              : belfastFetchStatus === "complete"
                ? "Import Complete"
                : "Import Failed – Retry"}
        </Button>
        {belfastFetchStatus === "loading" && (
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <LinearProgress />
          </Box>
        )}
      </Box>
      <Box sx={{ mx: 2.5, mb: 1.5 }}>
        {lastPositionFormatted && (
          <Typography variant="caption" sx={{ display: "block" }}>
            CruiseMapper last updated: {lastPositionFormatted}
          </Typography>
        )}
        {lastBelfastFormatted && (
          <Typography variant="caption" sx={{ display: "block" }}>
            Belfast Harbour schedule last imported: {lastBelfastFormatted}
          </Typography>
        )}
      </Box>
    </>
  )
}

export default CruisesImportButton
