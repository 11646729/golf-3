import { DatabaseAdapter } from "../databaseUtilities.js"
// import { openSqlDbConnection } from "../databaseUtilities.js"

// Database adapter for PostgreSQL - created lazily
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

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
  // console.log("In crimesController.js - Preparing empty crimes table...")
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
    // await createCrimesTableStructure()

    res.send("Crimes table prepared successfully").status(200)
  } catch (error) {
    console.error("Error preparing crimes table:", error)
    res.status(500).send("Error preparing crimes table")
  }
}

// -------------------------------------------------------
// Create empty crimes Table in the database
// -------------------------------------------------------
const createCrimesTableStructure = async (db) => {
  console.log(
    "In crimesController.js - Creating empty crimes table structure...",
  )
  if (db === null) return
}

// -------------------------------------------------------
// Delete all crimes records from database
// -------------------------------------------------------
const deleteCrimesData = async (db) => {
  console.log(
    "In crimesController.js - Deleting all crimes data from database...",
  )
  if (db === null) return
}

// -------------------------------------------------------
// Import Crimes Data into Database
// -------------------------------------------------------
export const importCrimesData = async (req, res) => {
  console.log("In crimesController.js - Importing crimes data into database...")
  // const db = await openSqlDbConnection()
}

// -------------------------------------------------------
// Local function
// -------------------------------------------------------
const populateCrimesTable = async (db, crimes) => {
  console.log("In crimesController.js - Populating crimes table with data...")
}

// -------------------------------------------------------
// Get all Crimes from Database
// Path: localhost:4000/api/crimes/getCrimes
// -------------------------------------------------------
export const getCrimesData = async (req, res) => {
  console.log(
    "In crimesController.js - Getting all crimes data from database...",
  )
}

export default getCrimesData
