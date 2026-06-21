import dotenv from "dotenv"
dotenv.config()
import { fetchAndSaveVesselMMSIs } from "./cruisemapperScraper.js"

await fetchAndSaveVesselMMSIs([
  { vesselname: "SILVER SPIRIT", vessellengthmetre: 210 },
])
process.exit(0)
