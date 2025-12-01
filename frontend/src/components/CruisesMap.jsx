import { useEffect, useMemo, useState } from "react"
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import Title from "./Title"
import "../styles/cruisesmap.scss"

const mapContainerStyle = {
  height: "600px",
  width: "100%",
  border: "1px solid #ccc",
  marginLeft: 0,
  marginRight: 0,
  marginBottom: 0,
}

const CruiseMapTitle = "Cruise Ship Positions Now"

const defaultMapZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)

const defaultMapCenter = {
  lat: parseFloat(import.meta.env.VITE_HOME_LATITUDE),
  lng: parseFloat(import.meta.env.VITE_HOME_LONGITUDE),
}

const parseCoordinate = (value) => {
  const num = parseFloat(value)
  return Number.isFinite(num) ? num : null
}

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

const normaliseVesselPositions = (positions = []) =>
  positions.reduce((list, vessel, index) => {
    const lat = parseCoordinate(vessel?.lat)
    const lng = parseCoordinate(vessel?.lng)

    if (lat === null || lng === null) {
      // return list
    } else {
      list.push({
        ...vessel,
        lat,
        lng,
        _markerId:
          vessel?.index ??
          vessel?.mmsi ??
          vessel?.imo ??
          vessel?.vesselId ??
          `vessel-${index}`,
      })
    }

    return list
  }, [])

const FitBoundsLayer = ({ positions }) => {
  const map = useMap()

  useEffect(() => {
    if (!map) {
      return
    }

    if (positions.length === 0) {
      // No positions yet - keep default view
    } else if (positions.length === 1) {
      const bounds = new window.google.maps.LatLngBounds()
      positions.forEach(({ lat, lng }) => bounds.extend({ lat, lng }))
      map.setCenter(bounds.getCenter())
      map.setZoom(Math.min(map.getZoom() ?? defaultMapZoom, 14))
    } else {
      const bounds = new window.google.maps.LatLngBounds()
      positions.forEach(({ lat, lng }) => bounds.extend({ lat, lng }))
      map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 })
    }
  }, [map, positions])

  return null
}

const getSelectedPosition = (positions, markerId) =>
  markerId
    ? positions.find((position) => position._markerId === markerId)
    : null

const CruisesMap = ({ vesselPositions = [] }) => {
  const validPositions = useMemo(
    () => normaliseVesselPositions(vesselPositions),
    [vesselPositions]
  )

  const [selectedId, setSelectedId] = useState(null)

  const selectedPosition = useMemo(
    () => getSelectedPosition(validPositions, selectedId),
    [validPositions, selectedId]
  )

  const handleMarkerClick = (markerId) => setSelectedId(markerId)
  const handleInfoWindowClose = () => setSelectedId(null)

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Title>{CruiseMapTitle}</Title>
      <div className="cruisesmapcontainer">
        <Map
          defaultZoom={defaultMapZoom}
          defaultCenter={defaultMapCenter}
          style={mapContainerStyle}
          mapId="cruise-map"
          disableDefaultUI={true}
          zoomControl={true}
        >
          <FitBoundsLayer positions={validPositions} />
          {validPositions.map((position) => (
            <AdvancedMarker
              key={position._markerId}
              position={{ lat: position.lat, lng: position.lng }}
              onClick={() => handleMarkerClick(position._markerId)}
            >
              <CustomCircle />
            </AdvancedMarker>
          ))}

          {selectedPosition ? (
            <InfoWindow
              position={{
                lat: selectedPosition.lat,
                lng: selectedPosition.lng,
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <Card>
                <CardMedia
                  style={{
                    height: 0,
                    paddingTop: "40%",
                    marginTop: "30",
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h3">
                    {selectedPosition.vesselName ?? "Vessel"}
                  </Typography>
                  {selectedPosition.timestamp ? (
                    <Typography component="p">
                      {selectedPosition.timestamp}
                    </Typography>
                  ) : null}
                  {selectedPosition.destination ? (
                    <Typography component="p">
                      En route to {selectedPosition.destination}
                    </Typography>
                  ) : null}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" component={Link}>
                    View
                  </Button>
                </CardActions>
              </Card>
            </InfoWindow>
          ) : null}
        </Map>
      </div>
    </APIProvider>
  )
}

export default CruisesMap
