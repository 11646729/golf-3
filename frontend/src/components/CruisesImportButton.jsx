import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"

const STATUS_LABEL = {
  idle:     "Import Belfast Schedule",
  loading:  "Importing Data…",
  complete: "Import Complete",
  error:    "Import Failed – Retry",
}

const STATUS_BG = {
  loading:  "#c62828",
  complete: "#000000",
  error:    "#e65100",
}

const CruisesImportButton = ({
  belfastFetchStatus,
  lastBelfastImportDate,
  onBelfastFetch,
}) => {
  const lastBelfastFormatted = lastBelfastImportDate
    ? lastBelfastImportDate.toLocaleDateString("en-GB")
    : null

  const bg = STATUS_BG[belfastFetchStatus]

  return (
    <>
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
            backgroundColor: bg,
            color: "white",
            "&:hover": { backgroundColor: bg },
            "&.Mui-disabled": { color: "#9e9e9e", backgroundColor: bg },
          }}
        >
          {STATUS_LABEL[belfastFetchStatus]}
        </Button>
        {belfastFetchStatus === "loading" && (
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <LinearProgress />
          </Box>
        )}
      </Box>
      <Box sx={{ mx: 2.5, mb: 1.5 }}>
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
