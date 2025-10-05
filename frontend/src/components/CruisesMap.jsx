import React, { useState, useEffect, useCallback, memo, useMemo } from "react"
import PropTypes from "prop-types"
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import CardActions from "@mui/material/CardActions"
import Paper from "@mui/material/Paper"
import Title from "./Title"
import "../styles/cruisesmap.scss"

const CruiseMapTitle = "Cruise Ship Positions Now"

const CruisesMap = (props) => {
  const { cruisesHomePosition, vesselPositions } = props

  CruisesMap.propTypes = {
    cruisesHomePosition: PropTypes.object,
    vesselPositions: PropTypes.array,
  }

  const [map, setMap] = useState(null)
  const [selected, setSelected] = useState(null)

  const mapZoom = useMemo(() => {
    const z = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM, 10)
    return Number.isFinite(z) ? z : 10
  }, [])

  // Helper to parse and validate coordinates
  const parseNum = (v) => {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : null
  }

  const mapCenter = useMemo(() => {
    const envLat = parseNum(import.meta.env.VITE_BELFAST_PORT_LATITUDE)
    const envLng = parseNum(import.meta.env.VITE_BELFAST_PORT_LONGITUDE)

    if (envLat !== null && envLng !== null) {
      return { lat: envLat, lng: envLng }
    }

    // fallback to cruisesHomePosition if valid
    if (
      cruisesHomePosition &&
      Number.isFinite(parseNum(cruisesHomePosition.lat)) &&
      Number.isFinite(parseNum(cruisesHomePosition.lng))
    ) {
      return {
        lat: parseNum(cruisesHomePosition.lat),
        lng: parseNum(cruisesHomePosition.lng),
      }
    }

    // fallback to first valid vessel position
    if (Array.isArray(vesselPositions)) {
      const first = vesselPositions.find(
        (p) =>
          Number.isFinite(parseNum(p?.lat)) && Number.isFinite(parseNum(p?.lng))
      )
      if (first) return { lat: parseNum(first.lat), lng: parseNum(first.lng) }
    }

    // ultimate fallback: Belfast approximate coords
    return { lat: 54.597285, lng: -5.93012 }
  }, [cruisesHomePosition, vesselPositions])

  const mapContainerStyle = {
    height: "600px",
    width: "100%",
    border: "1px solid #ccc",
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
  }

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_KEY,
  })

  // Store a reference to the google map instance in state
  const onLoadHandler = useCallback((Mymap) => {
    setMap(Mymap)
  }, [])

  // Clear the reference to the google map instance
  const onUnmountHandler = useCallback(() => {
    setMap(null)
  }, [])

  // Now compute bounds of map to display
  useEffect(() => {
    if (!map) return

    // Build bounds from valid positions only
    const validPositions = Array.isArray(vesselPositions)
      ? vesselPositions.filter(
          (p) =>
            Number.isFinite(parseNum(p?.lat)) &&
            Number.isFinite(parseNum(p?.lng))
        )
      : []

    if (validPositions.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      validPositions.forEach((v) =>
        bounds.extend({ lat: parseNum(v.lat), lng: parseNum(v.lng) })
      )
      map.fitBounds(bounds)
    } else if (
      Number.isFinite(mapCenter.lat) &&
      Number.isFinite(mapCenter.lng)
    ) {
      // No vessel positions — set center and zoom to defaults
      map.setCenter(mapCenter)
      map.setZoom(mapZoom)
    }
  }, [map, vesselPositions, mapCenter, mapZoom])

  const iconPin = {
    path: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z",
    fillColor: "#6dbef1",
    fillOpacity: 0.7,
    scale: 0.03, // to reduce the size of icons
    strokeColor: "#1342B4",
    strokeWeight: 1,
  }

  return isLoaded ? (
    <div>
      <div className="cruisesmaptitlecontainer">
        <Title>{CruiseMapTitle}</Title>
      </div>

      <Paper
        sx={{
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={{
            // mapTypeId: "hybrid",
            disableDefaultUI: true,
            zoomControl: true,
          }}
          onLoad={onLoadHandler}
          onUnmount={onUnmountHandler}
        >
          {Number.isFinite(parseNum(cruisesHomePosition?.lat)) &&
          Number.isFinite(parseNum(cruisesHomePosition?.lng)) ? (
            <Marker
              position={{
                lat: parseNum(cruisesHomePosition.lat),
                lng: parseNum(cruisesHomePosition.lng),
              }}
            />
          ) : null}

          {Array.isArray(vesselPositions)
            ? vesselPositions
                .filter(
                  (p) =>
                    Number.isFinite(parseNum(p?.lat)) &&
                    Number.isFinite(parseNum(p?.lng))
                )
                .map((vesselPosition, idx) => (
                  <Marker
                    key={vesselPosition.index ?? idx}
                    position={{
                      lat: parseNum(vesselPosition.lat),
                      lng: parseNum(vesselPosition.lng),
                    }}
                    icon={iconPin}
                    onClick={() => {
                      setSelected(vesselPosition)
                    }}
                  />
                ))
            : null}

          {selected &&
          Number.isFinite(parseNum(selected?.lat)) &&
          Number.isFinite(parseNum(selected?.lng)) ? (
            <InfoWindow
              position={{
                lat: parseNum(selected.lat),
                lng: parseNum(selected.lng),
              }}
              onCloseClick={() => {
                setSelected(null)
              }}
            >
              <Card>
                <CardMedia
                  style={{
                    height: 0,
                    paddingTop: "40%",
                    marginTop: "30",
                  }}
                  // image={selected.vesselurl}
                  // title={selected.vessseltitle}
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                  ></Typography>
                  <Typography component="p">{selected.vesselName}</Typography>
                  <Typography component="p">{selected.timestamp}</Typography>
                  <Typography component="p">
                    En Route to {selected.destination}
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
          ) : null}
        </GoogleMap>
      </Paper>
    </div>
  ) : null
}

export default memo(CruisesMap)
