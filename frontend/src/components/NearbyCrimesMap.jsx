import { useMemo, memo, useState, useCallback } from "react"
import PropTypes from "prop-types"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps"
import {
  Card,
  CardContent,
  Typography,
  Button,
  Link,
  CardActions,
} from "@mui/material"
import Title from "./Title"
import "../styles/nearbycrimesmap.scss"

const NearbyCrimesMapTitle = "Crimes Location Map"

const CustomCircle = ({
  color = "#78a32e",
  size = 15,
  borderColor = "#ffffff",
  borderWidth = 1,
}) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: "50%",
      border: `${borderWidth}px solid ${borderColor}`,
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      cursor: "pointer",
    }}
  />
)

const NearbyCrimesMap = (props) => {
  const [selectedMarker, setSelectedMarker] = useState(null)

  const { crimesData } = props

  NearbyCrimesMap.propTypes = {
    crimesData: PropTypes.array,
  }

  const mapContainerStyle = {
    height: "750px",
    width: "750px",
    border: "1px solid #ccc",
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 20,
  }

  const mapZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)

  const mapCenter = useMemo(
    () => ({
      lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
      lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
    }),
    [],
  )

  const selectedCrime = useMemo(() => {
    if (!selectedMarker) return null
    return crimesData.find((crime) => crime.id === selectedMarker) || null
  }, [selectedMarker, crimesData])

  const handleMarkerClick = useCallback((crimeId) => {
    setSelectedMarker(crimeId)
  }, [])

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="nearbycrimesmapcontainer">
        <Title>{NearbyCrimesMapTitle}</Title>
        <Map
          style={mapContainerStyle}
          defaultZoom={mapZoom}
          defaultCenter={mapCenter}
          mapId="nearby-crimes-map"
          disableDefaultUI={true}
          zoomControl={true}
          scrollwheel={true}
        >
          {/* Note: MarkerClusterer not yet available in vis.gl, using simple markers */}
          {crimesData.map((crime) => (
            <AdvancedMarker
              key={`crime-${crime.id}`}
              position={{
                lat: parseFloat(crime.location.latitude),
                lng: parseFloat(crime.location.longitude),
              }}
              onClick={() => handleMarkerClick(crime.id)}
            >
              <CustomCircle />
            </AdvancedMarker>
          ))}
          {selectedCrime
            ? (console.log("Selected crime:", selectedCrime),
              (
                <InfoWindow
                  position={{
                    lat: parseFloat(selectedCrime.location.latitude),
                    lng: parseFloat(selectedCrime.location.longitude),
                  }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <Card>
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        style={{
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {selectedCrime.category.replace(/-/g, " ")}
                      </Typography>
                      <Typography variant="body2">
                        {selectedCrime.location.street?.name ||
                          "Unknown street"}
                      </Typography>
                      {selectedCrime.outcome_status && (
                        <Typography
                          variant="body2"
                          style={{ color: "#666", marginTop: 4 }}
                        >
                          Outcome: {selectedCrime.outcome_status.category}
                        </Typography>
                      )}
                      <Typography variant="body2" style={{ color: "#666" }}>
                        Month: {selectedCrime.month}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        component={Link}
                        // to="/golfcoursespage"
                      >
                        View
                      </Button>
                    </CardActions>
                  </Card>
                </InfoWindow>
              ))
            : null}
        </Map>
      </div>
    </APIProvider>
  )
}

export default memo(NearbyCrimesMap)
