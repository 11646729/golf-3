import axios from "axios"
import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

const DEFAULT_CRIMES_DATE = "2024-01"
const DEFAULT_CRIMES_LAT = 52.629729
const DEFAULT_CRIMES_LNG = -1.131592
const DEFAULT_CRIMES_URL =
  "https://data.police.uk/api/crimes-street/all-crime?date=2024-01&lat=52.629729&lng=-1.131592"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/crimes/
// -------------------------------------------------------
export var index = (req, res) => {
  res.send({ response: "Crimes Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Prepare empty crimes Table ready to import data
// -------------------------------------------------------
export const createCrimesTable = async (req, res) => {
  try {
    // Check if crimes table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'crimes'
      )`,
    )

    if (tableExists.exists) {
      // If exists then delete the table and recreate
      console.log("crimes table exists - dropping and recreating")
      await getDb().run("DROP TABLE IF EXISTS crimes")
    } else {
      console.log("crimes table does not exist - creating the empty table")
    }

    // Create the table
    await createCrimesTableStructure()

    res.send("Crimes table prepared successfully").status(200)
  } catch (error) {
    console.error("Error preparing crimes table:", error)
    res.status(500).send("Error preparing crimes table")
  }
}

// -------------------------------------------------------
// Create empty crimes Table in the database
// -------------------------------------------------------
const createCrimesTableStructure = async () => {
  console.log(
    "In crimesController.js - Creating empty crimes table structure...",
  )

  await getDb().run(`
    CREATE TABLE IF NOT EXISTS crimes (
      crimeid BIGINT PRIMARY KEY,
      category TEXT NOT NULL,
      context TEXT,
      location_type TEXT,
      location_subtype TEXT,
      month TEXT NOT NULL,
      persistent_id TEXT,
      location_latitude REAL,
      location_longitude REAL,
      street_id BIGINT,
      street_name TEXT,
      outcome_category TEXT,
      outcome_date TEXT,
      raw_location JSONB,
      raw_outcome_status JSONB,
      source_date TEXT NOT NULL,
      source_lat REAL NOT NULL,
      source_lng REAL NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK (location_longitude IS NULL OR (location_longitude >= -180 AND location_longitude <= 180)),
      CHECK (location_latitude IS NULL OR (location_latitude >= -90 AND location_latitude <= 90))
    )
  `)

  await getDb().run(
    "CREATE INDEX IF NOT EXISTS idx_crimes_month ON crimes(month)",
  )

  await getDb().run(
    "CREATE INDEX IF NOT EXISTS idx_crimes_category ON crimes(category)",
  )

  console.log("Empty crimes table created")
}

// -------------------------------------------------------
// Delete all crimes records from database
// -------------------------------------------------------
const deleteCrimesData = async () => {
  console.log(
    "In crimesController.js - Deleting all crimes data from database...",
  )

  await getDb().run("TRUNCATE TABLE crimes")
}

// -------------------------------------------------------
// Import Crimes Data into Database
// -------------------------------------------------------
export const importCrimesData = async (req, res) => {
  try {
    console.log(
      "In crimesController.js - Importing crimes data into database...",
    )

    const date = req.body?.date || DEFAULT_CRIMES_DATE
    const lat = Number.parseFloat(req.body?.lat ?? DEFAULT_CRIMES_LAT)
    const lng = Number.parseFloat(req.body?.lng ?? DEFAULT_CRIMES_LNG)
    const crimesUrl =
      req.body?.url ||
      `${process.env.CRIMES_ENDPOINT || "https://data.police.uk/api/crimes-street/all-crime"}?date=${date}&lat=${lat}&lng=${lng}`

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "Invalid lat/lng values" })
    }

    await createCrimesTableStructure()
    await deleteCrimesData()

    const crimesResponse = await axios.get(crimesUrl)
    const crimes = Array.isArray(crimesResponse.data) ? crimesResponse.data : []

    await populateCrimesTable(crimes, { date, lat, lng })

    res.status(200).json({
      message: "Crimes data imported successfully",
      sourceUrl: crimesUrl,
      importedRecords: crimes.length,
    })
  } catch (error) {
    console.error("Error importing crimes data:", error)
    res.status(500).json({ error: "Error importing crimes data" })
  }
}

// -------------------------------------------------------
// Local function
// -------------------------------------------------------
const populateCrimesTable = async (crimes, sourceInfo) => {
  console.log("In crimesController.js - Populating crimes table with data...")

  if (!Array.isArray(crimes) || crimes.length === 0) return

  const sql = `
    INSERT INTO crimes (
      crimeid,
      category,
      context,
      location_type,
      location_subtype,
      month,
      persistent_id,
      location_latitude,
      location_longitude,
      street_id,
      street_name,
      outcome_category,
      outcome_date,
      raw_location,
      raw_outcome_status,
      source_date,
      source_lat,
      source_lng
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSONB), CAST(? AS JSONB), ?, ?, ?)
    ON CONFLICT (crimeid) DO UPDATE SET
      category = EXCLUDED.category,
      context = EXCLUDED.context,
      location_type = EXCLUDED.location_type,
      location_subtype = EXCLUDED.location_subtype,
      month = EXCLUDED.month,
      persistent_id = EXCLUDED.persistent_id,
      location_latitude = EXCLUDED.location_latitude,
      location_longitude = EXCLUDED.location_longitude,
      street_id = EXCLUDED.street_id,
      street_name = EXCLUDED.street_name,
      outcome_category = EXCLUDED.outcome_category,
      outcome_date = EXCLUDED.outcome_date,
      raw_location = EXCLUDED.raw_location,
      raw_outcome_status = EXCLUDED.raw_outcome_status,
      source_date = EXCLUDED.source_date,
      source_lat = EXCLUDED.source_lat,
      source_lng = EXCLUDED.source_lng
  `

  for (const crime of crimes) {
    const location = crime.location || {}
    const street = location.street || {}
    const outcomeStatus = crime.outcome_status || null

    const params = [
      crime.id,
      crime.category || null,
      crime.context || null,
      crime.location_type || null,
      crime.location_subtype || null,
      crime.month || sourceInfo.date,
      crime.persistent_id || null,
      location.latitude ? Number.parseFloat(location.latitude) : null,
      location.longitude ? Number.parseFloat(location.longitude) : null,
      street.id || null,
      street.name || null,
      outcomeStatus?.category || null,
      outcomeStatus?.date || null,
      JSON.stringify(location),
      JSON.stringify(outcomeStatus),
      sourceInfo.date,
      sourceInfo.lat,
      sourceInfo.lng,
    ]

    await getDb().run(sql, params)
  }
}

// -------------------------------------------------------
// Get all Crimes from Database
// Path: localhost:4000/api/crimes/getCrimes
// -------------------------------------------------------
export const getCrimesData = async (req, res) => {
  try {
    console.log(
      "In crimesController.js - Getting all crimes data from database...",
    )

    const crimes = await getDb().all(
      "SELECT * FROM crimes ORDER BY month DESC, crimeid DESC",
    )

    res.status(200).json({ message: "success", data: crimes })
  } catch (error) {
    console.error("Error getting crimes data:", error)
    res.status(500).json({ error: "Error getting crimes data" })
  }
}

export const importDefaultCrimesData = async () => {
  const crimesResponse = await axios.get(DEFAULT_CRIMES_URL)
  const crimes = Array.isArray(crimesResponse.data) ? crimesResponse.data : []

  await createCrimesTableStructure()
  await deleteCrimesData()
  await populateCrimesTable(crimes, {
    date: DEFAULT_CRIMES_DATE,
    lat: DEFAULT_CRIMES_LAT,
    lng: DEFAULT_CRIMES_LNG,
  })

  return crimes.length
}

export default getCrimesData
