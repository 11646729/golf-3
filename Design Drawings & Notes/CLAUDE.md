# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Running the application
```bash
# Run both backend and frontend together (from root)
npm start

# Run individually
npm run start:backend
npm run start:frontend

# Backend dev mode with auto-reload
cd backend && npm run dev
```

### Backend-only scripts
```bash
cd backend
npm test          # runs objecttest.js
npm run test1     # runs isInsideArea.js
npm run migrate:vessels  # run vessel column migration
```

### Frontend build
```bash
cd frontend
npm run build     # Vite production build
npm run preview   # Preview production build
```

## Architecture

This is a **npm workspaces monorepo** with `backend` and `frontend` as the two workspaces.

### Backend (Express, port 4000)
- Entry point: `backend/server.js` — sets up Express, CORS, Socket.io, and mounts all route catalogs
- **Route pattern**: `routes/*RouteCatalog.js` → `controllers/*Controller.js` — each data domain has its own route file and controller
- **Real-time data**: `backend/enableRealtimeData.js` uses Socket.io to push live updates to the frontend
- **Database**: PostgreSQL via `pg` library. `backend/databaseUtilities.js` provides a `DatabaseAdapter` class that converts `?` placeholders to `$N` (PostgreSQL style) and a `LazyDatabaseAdapter` for lazy connection initialization
- **Migrations**: `backend/migrations/` — run manually via npm scripts or directly with node
- **Scheduled jobs**: `node-cron` used within controllers for periodic data fetching
- **External data sources**: OpenWeather API, UK Police API, Google Calendar API, NewsAPI, Transport for Ireland GTFS feeds, port arrival scraping with Cheerio
- **Message queuing**: amqplib (RabbitMQ) is a dependency but usage is limited

### Frontend (React + Vite, port 3000)
- Entry: `frontend/src/index.jsx` → `frontend/src/components/App.jsx` (React Router v7)
- **10 routes**, each backed by a page component in `frontend/src/pages/`
- **UI**: Material UI (@mui) for components, SASS for styling, Recharts for charts
- **Maps**: Google Maps via `@vis.gl/react-google-maps`; canvas drawing via Konva/react-konva
- **Real-time**: `socket.io-client` connects to backend for live data
- **Config**: All API endpoints and map config (coordinates, API keys, zoom levels) come from `frontend/.env`

### Data Domains
| Domain | Backend Route | Description |
|---|---|---|
| Golf courses | `/api/golf` | Course data from local JSON file |
| Weather | `/api/weather` | OpenWeather API data |
| Crimes | `/api/crimes` | UK Police API, stored in PostgreSQL |
| Cruise vessels | `/api/cruise` | Web-scraped port arrivals + vessel tracking |
| Transport (GTFS) | `/api/gtfs` | Transport for Ireland static GTFS feeds |
| Seismic designs | `/api/seismicdesigns` | Seismic array geometry |
| News | `/api/rtnews` | NewsAPI aggregation |
| Calendar | `/api/rtcalendar` | Google Calendar integration |

### Environment Variables
- `backend/.env` — server port, DB connection URL, API keys (OpenWeather, Google), home coordinates, port locations, GTFS data path, golf data path
- `frontend/.env` — backend socket/API URLs, Google Maps API key, map defaults (home coords, zoom, named locations)

### Database Tables
- **vessels** — cruise ship tracking (vesselid, vesselname, vesseltype, coordinates, etc.)
- **crimes** — UK Police API data (crimeid, category, coordinates, month, outcome; raw JSONB fields)
- **GTFS tables** — agency, stops, routes, trips, stop_times, transfers (populated by import scripts)

### Notable Directories
- `backend/createGTFSTables/` — scripts to initialize GTFS schema
- `backend/gtfs_config_files/` — GTFS import configuration (the actual data dir `backend/gtfs_data/` is gitignored)
- `frontend/src/functionHandlers/` — business logic separated from components
- `mockdatabackend/` and `mockdatafrontend/` — standalone mock-data versions for development/testing
- `teeBooking/` — a separate, standalone tee booking module (has its own entry point `index.js`)
