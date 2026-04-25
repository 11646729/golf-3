import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"

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

const TransportRoutesImportButton = ({
  fetchStatus,
  lastImportDate,
  onFetch,
}) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const downloadedBeforeToday = !lastImportDate || lastImportDate < today

  const lastImportFormatted = lastImportDate
    ? lastImportDate.toLocaleDateString("en-GB")
    : null

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
              Importing GTFS data…
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
    </>
  )
}

export default TransportRoutesImportButton
