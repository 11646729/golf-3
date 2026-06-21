import dotenv from "dotenv"
dotenv.config()
import { fetchAndSaveVesselMMSIs } from "./cruisemapperScraper.js"

// Use the exact Unicode right-quote name as stored in the DB
await fetchAndSaveVesselMMSIs([
  { vesselname: "L’AUSTRAL", vessellengthmetre: 142 },
])
process.exit(0)
