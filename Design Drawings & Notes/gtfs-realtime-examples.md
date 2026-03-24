# GTFS Realtime Examples

How to add live vehicle positions to the existing static GTFS Transport Routes page.

The approach follows the same Socket.io pattern used by `rtWeatherController.js` and `enableRealtimeData.js`.

---

## Overview of Changes

| File | Change |
|---|---|
| `backend/controllers/rtGtfsController.js` | New file — fetch, parse, store, and emit vehicle positions |
| `backend/enableRealtimeData.js` | Add GTFS cron job alongside existing ones |
| `frontend/src/pages/TransportRoutesPage.jsx` | Connect socket, receive vehicle positions, pass to map |
| `frontend/src/components/TransportRoutesMap.jsx` | Render live vehicle markers on the map |

---

## Step 1 — Backend: `rtGtfsController.js`

Create `backend/controllers/rtGtfsController.js`.

This fetches the Transport for Ireland GTFS Realtime protobuf feed, decodes it with `gtfs-realtime-bindings` (already installed), upserts positions to PostgreSQL, and provides an emit function.

```js
// backend/controllers/rtGtfsController.js
import axios from "axios"
import GtfsRealtimeBindings from "gtfs-realtime-bindings"
import { DatabaseAdapter } from "../databaseUtilities.js"

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

// Transport for Ireland GTFS-RT vehicle positions feed
// Requires TRANSPORT_FOR_IRELAND_RT_API_KEY in backend/.env
const VEHICLE_POSITIONS_URL =
  "https://api.nationaltransport.ie/gtfsr/v2/Vehicles"

// -------------------------------------------------------
// Create vehicle_positions table if it doesn't exist
// Call once at startup (optional — can be a migration instead)
// -------------------------------------------------------
export const createVehiclePositionsTable = async () => {
  await getDb().run(`
    CREATE TABLE IF NOT EXISTS vehicle_positions (
      vehicle_id    TEXT PRIMARY KEY,
      trip_id       TEXT,
      route_id      TEXT,
      latitude      REAL,
      longitude     REAL,
      bearing       REAL,
      speed         REAL,
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

// -------------------------------------------------------
// Fetch GTFS-RT protobuf feed and return parsed entities
// -------------------------------------------------------
export const fetchVehiclePositions = async () => {
  const response = await axios.get(VEHICLE_POSITIONS_URL, {
    headers: {
      "x-api-key": process.env.TRANSPORT_FOR_IRELAND_RT_API_KEY,
    },
    responseType: "arraybuffer",
    timeout: 10000,
  })

  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(response.data),
  )

  // Return only entities that have a vehicle position
  return feed.entity.filter((entity) => entity.vehicle?.position)
}

// -------------------------------------------------------
// Upsert vehicle positions to PostgreSQL
// -------------------------------------------------------
const saveVehiclePositions = async (entities) => {
  for (const entity of entities) {
    const { vehicle } = entity
    const vehicleId = vehicle.vehicle?.id ?? entity.id
    const tripId = vehicle.trip?.tripId ?? null
    const routeId = vehicle.trip?.routeId ?? null
    const { latitude, longitude, bearing, speed } = vehicle.position

    await getDb().run(
      `INSERT INTO vehicle_positions
         (vehicle_id, trip_id, route_id, latitude, longitude, bearing, speed, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
       ON CONFLICT (vehicle_id) DO UPDATE SET
         trip_id    = EXCLUDED.trip_id,
         route_id   = EXCLUDED.route_id,
         latitude   = EXCLUDED.latitude,
         longitude  = EXCLUDED.longitude,
         bearing    = EXCLUDED.bearing,
         speed      = EXCLUDED.speed,
         updated_at = NOW()`,
      [vehicleId, tripId, routeId, latitude, longitude, bearing ?? null, speed ?? null],
    )
  }
}

// -------------------------------------------------------
// Read current vehicle positions from PostgreSQL
// Optionally filter by routeId
// -------------------------------------------------------
export const getVehiclePositionsFromDb = async (routeId = null) => {
  if (routeId) {
    return getDb().all(
      `SELECT vehicle_id, trip_id, route_id, latitude, longitude, bearing, speed
       FROM vehicle_positions
       WHERE route_id = ?
       AND updated_at > NOW() - INTERVAL '2 minutes'`,
      [routeId],
    )
  }
  return getDb().all(
    `SELECT vehicle_id, trip_id, route_id, latitude, longitude, bearing, speed
     FROM vehicle_positions
     WHERE updated_at > NOW() - INTERVAL '2 minutes'`,
  )
}

// -------------------------------------------------------
// Fetch → save → return positions (called by cron job)
// -------------------------------------------------------
export const updateAndGetVehiclePositions = async () => {
  const entities = await fetchVehiclePositions()
  await saveVehiclePositions(entities)
  return getVehiclePositionsFromDb()
}

// -------------------------------------------------------
// Socket.io emit — same pattern as emitTemperatureData
// -------------------------------------------------------
export const emitVehiclePositions = (socket, positions, stillLoading) => {
  if (!socket || positions == null || stillLoading == null) return
  socket.emit("FromGtfsVehiclePositions", positions)
  socket.emit("FromIsLoadingGtfsVehiclePositions", stillLoading)
}
```

Add to `backend/.env`:
```
TRANSPORT_FOR_IRELAND_RT_API_KEY=your_key_here
```

---

## Step 2 — Backend: Update `enableRealtimeData.js`

Add the GTFS cron job alongside the existing ones. The realtime feed updates roughly every 10–30 seconds, so polling every 15 seconds is appropriate.

```js
// enableRealtimeData.js — add these imports at the top
import {
  emitVehiclePositions,
  updateAndGetVehiclePositions,
} from "./controllers/rtGtfsController.js"
```

Inside `enableRealtimeData`, add the interval variable and schedule:

```js
export const enableRealtimeData = (io) => {
  let Heartbeat,
    CalendarEventsInterval,
    TemperatureInterval,
    NewsHeadlinesInterval,
    GtfsVehiclePositionsInterval          // <-- add this

  io.on("connection", (socket) => {
    console.log("New client connected")

    if (
      Heartbeat ||
      CalendarEventsInterval ||
      TemperatureInterval ||
      NewsHeadlinesInterval ||
      GtfsVehiclePositionsInterval        // <-- add this
    ) {
      Heartbeat.stop()
      CalendarEventsInterval.stop()
      TemperatureInterval.stop()
      NewsHeadlinesInterval.stop()
      GtfsVehiclePositionsInterval.stop() // <-- add this
    }

    // ... existing schedules unchanged ...

    // Poll every 15 seconds — "*/15 * * * * *"
    GtfsVehiclePositionsInterval = nodeCron.schedule("*/15 * * * * *", () => {
      getGtfsVehiclePositionsAndEmit(socket)
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected")
      Heartbeat.stop()
      CalendarEventsInterval.stop()
      TemperatureInterval.stop()
      NewsHeadlinesInterval.stop()
      GtfsVehiclePositionsInterval.stop() // <-- add this
    })
  })

  // ... existing fetch functions unchanged ...

  // -----------------------------
  // Fetch GTFS Realtime vehicle positions
  // -----------------------------
  const getGtfsVehiclePositionsAndEmit = (socket) => {
    updateAndGetVehiclePositions()
      .then((positions) => {
        emitVehiclePositions(socket, positions, false)
      })
      .catch((error) => {
        console.error("GTFS realtime fetch error:", error.message)
      })
  }
}
```

---

## Step 3 — Frontend: Update `TransportRoutesPage.jsx`

Connect to Socket.io and receive live vehicle positions. Pass them to the map alongside the existing static data.

```jsx
// TransportRoutesPage.jsx — updated version
import { useState, useEffect, memo } from "react"
import socketIOClient from "socket.io-client"           // add
import TransportRoutesMap from "../components/TransportRoutesMap"
import { Autocomplete, TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  getAllAgenciesFrontEnd,
  getRoutesForSingleAgencyFrontEnd,
  getShapesForSingleRouteFrontEnd,
  getStopsForSingleRouteFrontEnd,
} from "../functionHandlers/loadStaticGTFSDataHandler"
import "../styles/transportroutes.scss"

// ... StyledAutocomplete definition unchanged ...

const TransportRoutesPage = () => {
  const [transportAgencyArray, setTransportAgencyArray] = useState([])
  const [transportAgencyId, setTransportAgencyId] = useState("")
  const [transportAgencyName, setTransportAgencyName] = useState("")
  const [transportRoutesArray, setTransportRoutesArray] = useState([])
  const [transportShapesArray, setTransportShapesArray] = useState([])
  const [transportStopsArray, setTransportStopsArray] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [vehiclePositions, setVehiclePositions] = useState([])    // add
  const [selectedRouteId, setSelectedRouteId] = useState(null)    // add

  const transportAgenciesDataUrl =
    import.meta.env.VITE_EXPRESS_SERVER_ENDPOINT_URL + "/api/gtfs/transportagencies"
  const routesDataBaseUrl =
    import.meta.env.VITE_EXPRESS_SERVER_ENDPOINT_URL + "/api/gtfs/routesforsingleagency?transportAgencyId="
  const shapesDataBaseUrl =
    import.meta.env.VITE_EXPRESS_SERVER_ENDPOINT_URL + "/api/gtfs/shapesforsingleroute?routeId="
  const stopsDataBaseUrl =
    import.meta.env.VITE_EXPRESS_SERVER_ENDPOINT_URL + "/api/gtfs/stopsforsingleroute?routeId="

  // Socket.io — vehicle positions
  useEffect(() => {
    const socket = socketIOClient(
      import.meta.env.VITE_EXPRESS_SERVER_ENDPOINT_URL,
      { autoConnect: false },
    )
    socket.connect()

    socket.on("FromGtfsVehiclePositions", (positions) => {
      // If a route is selected, filter to that route only
      if (selectedRouteId) {
        setVehiclePositions(
          positions.filter((v) => v.route_id === selectedRouteId),
        )
      } else {
        setVehiclePositions(positions)
      }
    })

    return () => socket.disconnect()
  }, [selectedRouteId])

  // Load agencies on mount
  useEffect(() => {
    getAllAgenciesFrontEnd(transportAgenciesDataUrl)
      .then((data) => {
        setTransportAgencyArray(data)
        setIsLoading(false)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="transportroutescontainer">
      <div className="transportroutestablescontainer">
        <div className="transportroutestables2container">
          <div className="transportagenciestablecontainer">
            {/* Agency dropdown — unchanged */}
            <StyledAutocomplete
              id="agency-box"
              disablePortal
              onChange={(_, newValue) => {
                setTransportAgencyId(newValue.agencyid)
                setTransportAgencyName(newValue.label)
                getRoutesForSingleAgencyFrontEnd(
                  routesDataBaseUrl + newValue.agencyid,
                  transportAgencyId,
                ).then((returnedData) => {
                  setTransportRoutesArray(returnedData)
                })
              }}
              options={transportAgencyArray}
              renderOption={(props, option) => (
                <li {...props} key={option.agencyid}>{option.label}</li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ input: { color: "white" }, width: 580, marginBottom: 4 }}
                  label="Agency"
                  InputLabelProps={{ ...params.InputLabelProps, style: { color: "white" } }}
                />
              )}
            />

            {/* Route dropdown — add setSelectedRouteId */}
            <StyledAutocomplete
              id="routes-box"
              disabled={!transportAgencyId}
              onChange={(_, newValue) => {
                setSelectedRouteId(newValue.routeid)             // add
                getShapesForSingleRouteFrontEnd(
                  shapesDataBaseUrl + newValue.routeid,
                  newValue.routeid,
                  transportRoutesArray,
                ).then((returnedData) => {
                  setTransportShapesArray(returnedData)
                })
                getStopsForSingleRouteFrontEnd(
                  stopsDataBaseUrl + newValue.routeid,
                  newValue.routeid,
                  transportRoutesArray,
                ).then((returnedData) => {
                  setTransportStopsArray(returnedData)
                })
              }}
              options={transportRoutesArray}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ input: { color: "white" }, width: 580 }}
                  label="Routes"
                  InputLabelProps={{ ...params.InputLabelProps, style: { color: "white" } }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="transportroutesmapcontainer">
        <TransportRoutesMap
          isLoading={isLoading}
          transportAgencyName={transportAgencyName}
          transportShapesArray={transportShapesArray}
          transportStopsArray={transportStopsArray}
          vehiclePositions={vehiclePositions}           // add
        />
      </div>
    </div>
  )
}

export default memo(TransportRoutesPage)
```

---

## Step 4 — Frontend: Update `TransportRoutesMap.jsx`

Accept `vehiclePositions` as a prop and render each vehicle as a distinct marker.

```jsx
// TransportRoutesMap.jsx — additions only

// Add vehiclePositions to destructured props
const TransportRoutesMap = (props) => {
  const {
    transportAgencyName,
    transportShapesArray,
    transportStopsArray,
    vehiclePositions = [],    // add
  } = props

  TransportRoutesMap.propTypes = {
    transportAgencyName: PropTypes.string,
    transportShapesArray: PropTypes.array,
    transportStopsArray: PropTypes.array,
    vehiclePositions: PropTypes.array,    // add
  }

  // ... existing state and helpers unchanged ...

  // New marker component for live vehicles
  const VehicleBusIcon = ({ bearing }) => (
    <div
      style={{
        width: "16px",
        height: "16px",
        backgroundColor: "#f59e0b",   // amber
        borderRadius: "3px",
        border: "2px solid #ffffff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
        cursor: "pointer",
        transform: bearing != null ? `rotate(${bearing}deg)` : "none",
      }}
    />
  )

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div>
        <div>
          <Title>{transportAgencyName}</Title>
        </div>
        <div className="transportroutesmapcontainer">
          <Map
            style={mapContainerStyle}
            defaultCenter={mapCenter}
            defaultZoom={mapZoom}
            mapId="transport-routes-map"
            disableDefaultUI={true}
            zoomControl={true}
          >
            <FitBoundsLayer stops={validStops} defaultZoom={mapZoom} />

            {/* Route shape polylines — unchanged */}
            {transportShapesArray?.map((transportShape) => (
              <Polyline
                key={transportShape.shapeKey}
                path={transportShape.shapeCoordinates}
                options={{ strokeColor: "#FF0000", strokeOpacity: "1.0", strokeWeight: 1 }}
              />
            ))}

            {/* Static stop markers — unchanged */}
            {validStops.map((transportStop) => (
              <AdvancedMarker
                key={transportStop.stop_id}
                position={{ lat: transportStop.lat, lng: transportStop.lng }}
                onClick={() => handleMarkerClick(transportStop.stop_id)}
              >
                <CustomCircle />
              </AdvancedMarker>
            ))}

            {/* Live vehicle markers — new */}
            {vehiclePositions.map((vehicle) => (
              <AdvancedMarker
                key={vehicle.vehicle_id}
                position={{ lat: vehicle.latitude, lng: vehicle.longitude }}
                title={`Vehicle ${vehicle.vehicle_id}${vehicle.speed != null ? ` · ${Math.round(vehicle.speed)} km/h` : ""}`}
              >
                <VehicleBusIcon bearing={vehicle.bearing} />
              </AdvancedMarker>
            ))}

            {/* Stop info window — unchanged */}
            {selectedStop && (
              <InfoWindow
                position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                {/* ... card content unchanged ... */}
              </InfoWindow>
            )}
          </Map>
        </div>
      </div>
    </APIProvider>
  )
}
```

---

## Data Flow Summary

```
Transport for Ireland RT API (protobuf)
        |
        | axios GET every 15s (cron)
        v
rtGtfsController.fetchVehiclePositions()
        |
        | gtfs-realtime-bindings decode
        v
vehicle_positions table (PostgreSQL UPSERT)
        |
        | getVehiclePositionsFromDb()
        v
emitVehiclePositions(socket, positions, false)
        |
        | Socket.io "FromGtfsVehiclePositions"
        v
TransportRoutesPage.jsx — setVehiclePositions()
        |
        | prop
        v
TransportRoutesMap.jsx — amber square markers
```

---

## Database Migration

Run once to create the `vehicle_positions` table, or call `createVehiclePositionsTable()` at startup:

```sql
CREATE TABLE IF NOT EXISTS vehicle_positions (
  vehicle_id    TEXT PRIMARY KEY,
  trip_id       TEXT,
  route_id      TEXT,
  latitude      REAL,
  longitude     REAL,
  bearing       REAL,
  speed         REAL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for route filtering
CREATE INDEX IF NOT EXISTS idx_vehicle_positions_route_id
  ON vehicle_positions (route_id);
```

---

## Notes

- The `gtfs-realtime-bindings` package is already in `package.json` — no extra install needed.
- `TRANSPORT_FOR_IRELAND_RT_API_KEY` must be added to `backend/.env`. Keys are free from [developer.nationaltransport.ie](https://developer.nationaltransport.ie).
- The `updated_at > NOW() - INTERVAL '2 minutes'` filter in `getVehiclePositionsFromDb` ensures stale positions are excluded automatically.
- Vehicle markers rotate to show heading when `bearing` is available in the feed.
- The existing `getAllVehiclePositions` REST endpoint in `gtfsTransportController.js` (which has a hardcoded trip ID) can be replaced or extended using `getVehiclePositionsFromDb` once the realtime pipeline is working.
