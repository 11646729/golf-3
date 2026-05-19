import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"

const buttonBg = {
  loading: "#c62828",
  error: "#e65100",
}

const CruisesImportButton = ({
  belfastFetchStatus,
  lastBelfastImportDate,
  onBelfastFetch,
}) => {
  const lastBelfastFormatted = lastBelfastImportDate
    ? lastBelfastImportDate.toLocaleDateString("en-GB")
    : null

  return (
    <>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, mx: 2.5, my: 1.5 }}
      >
        <Button
          variant="contained"
          disabled={
            belfastFetchStatus === "loading" ||
            belfastFetchStatus === "complete"
          }
          onClick={onBelfastFetch}
          sx={{
            textTransform: "capitalize",
            minWidth: 200,
            backgroundColor:
              belfastFetchStatus === "complete"
                ? "#000000"
                : buttonBg[belfastFetchStatus],
            color: "white",
            "&:hover": {
              backgroundColor:
                belfastFetchStatus === "complete"
                  ? "#000000"
                  : (buttonBg[belfastFetchStatus] ?? undefined),
            },
            "&.Mui-disabled": { color: "#9e9e9e", backgroundColor: "#000000" },
          }}
        >
          {belfastFetchStatus === "idle"
            ? "Import Belfast Schedule"
            : belfastFetchStatus === "loading"
              ? "Importing Data…"
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
