# Plan: Real-time AIS Feed for Belfast Vessels

## Context

The project already has a `vessels` table in PostgreSQL populated via CruiseMapper/MyShipTracking web scraping. Vessels have `vesselmmsinumber`, `currentpositionlng`, `currentpositionlat`, and `currentpositiontime` columns. The goal is to keep those position fields live by connecting to aisstream.io's WebSocket AIS feed when the server starts.

---

## Approach

1. **New service file** `backend/aisStreamService.js` — a self-contained WebSocket client that:
   - Loads all MMSI numbers from the `vessels` table on startup
   - Opens a persistent WebSocket to `wss://stream.aisstream.io/v0/stream`
   - Subscribes with a bounding box covering the Irish Sea / Belfast approaches (`[[51.0, -10.0], [56.0, 1.0]]`) combined with `FiltersShipMMSI` listing the tracked MMSIs
   - On each `PositionReport` message, UPDATE the matching vessel row's `currentpositionlng`, `currentpositionlat`, `currentpositiontime`
   - Reconnects with exponential backoff (max 30 s) if the connection drops

2. **Modify `backend/server.js`** — call `startAISStream()` immediately after `createDatabaseAdapter()` resolves (inside the `.then()` block, after `httpServer.listen`).

3. **Add `AISSTREAM_API_KEY`** to `backend/.env`.

4. **Install `ws`** package in the backend workspace (Node's built-in `WebSocket` global requires Node ≥ 21; using `ws` avoids a Node version constraint).

---

## Critical Files

| File | Change |
|------|--------|
| `backend/aisStreamService.js` | **Create** — AIS WebSocket client service |
| `backend/server.js` | **Edit** — import and call `startAISStream()` after DB connects |
| `backend/.env` | **Edit** — add `AISSTREAM_API_KEY=<your_key>` |
| `backend/package.json` | **Edit** — add `ws` dependency |

---

## Implementation Detail

### `aisStreamService.js`

```js
import WebSocket from "ws"
import { DatabaseAdapter } from "./databaseUtilities.js"

const AIS_STREAM_URL = "wss://stream.aisstream.io/v0/stream"
const RECONNECT_DELAY_INITIAL_MS = 2_000
const RECONNECT_DELAY_MAX_MS = 30_000

// Bounding box covering the Irish Sea and Belfast approaches
// Format: [[minLat, minLng], [maxLat, maxLng]]
const BELFAST_REGION_BOX = [[51.0, -10.0], [56.0, 1.0]]

export async function startAISStream() {
  const db = new DatabaseAdapter()
  let reconnectDelay = RECONNECT_DELAY_INITIAL_MS

  const connect = async () => {
    // Load all tracked MMSI numbers from the database
    let mmsiList = []
    try {
      const rows = await db.all(
        "SELECT vesselmmsinumber FROM vessels WHERE vesselmmsinumber IS NOT NULL"
      )
      mmsiList = rows.map((r) => String(r.vesselmmsinumber))
      console.log(`[AIS] Loaded ${mmsiList.length} vessel MMSI number(s) from database`)
    } catch (err) {
      console.error("[AIS] Failed to load MMSIs from database:", err.message)
      setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_DELAY_MAX_MS)
      return
    }

    const ws = new WebSocket(AIS_STREAM_URL)

    ws.on("open", () => {
      console.log("[AIS] Connected to aisstream.io")
      reconnectDelay = RECONNECT_DELAY_INITIAL_MS
      ws.send(JSON.stringify({
        APIKey: process.env.AISSTREAM_API_KEY,
        BoundingBoxes: [BELFAST_REGION_BOX],
        FiltersShipMMSI: mmsiList,
      }))
    })

    ws.on("message", async (data) => {
      let msg
      try {
        msg = JSON.parse(data)
      } catch {
        console.error("[AIS] Failed to parse message:", data)
        return
      }

      if (msg.MessageType === "PositionReport") {
        const { MMSI, latitude, longitude, time_utc } = msg.MetaData
        try {
          const result = await db.run(
            `UPDATE vessels
               SET currentpositionlat = ?,
                   currentpositionlng = ?,
                   currentpositiontime = ?
             WHERE vesselmmsinumber = ?`,
            [latitude, longitude, time_utc, MMSI]
          )
          if (result.changes > 0) {
            console.log(
              `[AIS] Position updated — MMSI ${MMSI}: lat ${latitude}, lng ${longitude}`
            )
          }
        } catch (err) {
          console.error(`[AIS] DB update failed for MMSI ${MMSI}:`, err.message)
        }
      }
    })

    ws.on("error", (err) => {
      console.error("[AIS] WebSocket error:", err.message)
    })

    ws.on("close", () => {
      console.log(`[AIS] Connection closed — reconnecting in ${reconnectDelay / 1000}s`)
      setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_DELAY_MAX_MS)
    })
  }

  connect()
}
```

### `server.js` addition

```js
import { startAISStream } from "./aisStreamService.js"
// …
createDatabaseAdapter().then(() => {
  httpServer.listen(port, …)
  startAISStream()   // ← add this line
})
```

---

## Notes

- `FiltersShipMMSI` in the aisstream.io subscription limits traffic to only our tracked vessels, so we don't process the full Irish Sea feed.
- MMSIs are loaded once at startup. If new vessels are scraped and added later, a server restart picks them up. (A future enhancement could reload MMSIs periodically, but that's out of scope here.)
- The `ws` package is the standard Node WebSocket client and is already widely used (it's a transitive dependency of many packages); installing it explicitly avoids relying on that assumption.

---

## Verification

1. Add your aisstream.io API key to `backend/.env` as `AISSTREAM_API_KEY`.
2. Run `npm install` in `backend/` to install `ws`.
3. Start the server (`npm run start:backend`).
4. Watch the console for `[AIS] Connected to aisstream.io` and `[AIS] Updated position for MMSI …` log lines.
5. Query the DB: `SELECT vesselname, currentpositionlat, currentpositionlng, currentpositiontime FROM vessels WHERE currentpositionlat IS NOT NULL;` — rows should show live positions.
6. Kill the server network connection briefly to confirm reconnect logic fires.
