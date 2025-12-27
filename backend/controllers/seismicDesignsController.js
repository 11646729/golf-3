// import fs from "fs"
import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL - created lazily to avoid startup connection spam
let db = null
const getDb = () => {
  if (!db) {
    db = new DatabaseAdapter()
  }
  return db
}

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/seismicdesigns/
// -------------------------------------------------------
export var index = (req, res) => {
  res.send({ response: "Seismic Designs Route Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Prepare empty seismicdesigns Table ready to import data
// -------------------------------------------------------
export const createSeismicDesignsTable = async (req, res) => {
  try {
    // Check if seismicdesigns table exists using PostgreSQL system tables
    const tableExists = await getDb().get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'seismicdesigns'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete all values
      console.log("seismicdesigns table exists")
      await deleteSeismicDesigns()
    } else {
      // Else create table
      console.log("seismicdesigns table does not exist")
      await createSeismicDesignsTableStructure()
    }

    res.send({ message: "Seismic Designs table prepared successfully" })
  } catch (error) {
    console.error("Error in createSeismicDesignsTable:", error.message)
    res.status(500).send({ error: "Failed to prepare Seismic Designs table" })
  }
}

// -------------------------------------------------------
// Create seismicdesigns Table in PostgreSQL database
// -------------------------------------------------------
const createSeismicDesignsTableStructure = async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS seismicdesigns (
        seismicdesignid SERIAL PRIMARY KEY, 
        databaseversion INTEGER, 
        type TEXT NOT NULL
      )
    `

    await getDb().run(sql)
    console.log("Empty seismicdesigns table created")
  } catch (error) {
    console.error("Error in createSeismicDesignsTableStructure:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Delete all seismicdesigns records from PostgreSQL database
// -------------------------------------------------------
const deleteSeismicDesigns = async () => {
  try {
    // Count the records in the database
    const countResult = await getDb().get(
      "SELECT COUNT(seismicdesignid) AS count FROM seismicdesigns"
    )

    if (countResult && countResult.count > 0) {
      // Delete all the data in the seismicdesigns table
      await getDb().run("DELETE FROM seismicdesigns")
      console.log("All seismicdesigns data deleted")

      // Reset the sequence (PostgreSQL equivalent of sqlite_sequence)
      await getDb().run(
        "ALTER SEQUENCE seismicdesigns_seismicdesignid_seq RESTART WITH 1"
      )
      console.log("Seismic Designs ID sequence reset to 1")
    } else {
      console.log("seismicdesigns table was empty (so no data deleted)")
    }
  } catch (error) {
    console.error("Error in deleteSeismicDesigns:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Import Seismic Designs Table in the SQLite Database
// -------------------------------------------------------
export const importSeismicDesignsData = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // Fetch all the Seismic Designs data
    fs.readFile(
      // process.env.RAW_GOLF_COURSE_DATA_FILEPATH,
      "utf8",
      (err, data) => {
        if (err) {
          console.error(err.message)
        }

        // Save the data in the seismicdesigns Table in the SQLite database
        const courses = JSON.parse(data)
        populateSeismicDesigns(courses)
      }
    )
  } catch (err) {
    console.error("Error in importSeismicDesignsData: ", err.message)
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Local function
// -------------------------------------------------------
const populateSeismicDesigns = (courses) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  let loop = 0
  try {
    do {
      // courseid == loop
      const course = [
        loop,
        // process.env.DATABASE_VERSION,
        // process.env.TYPE_GOLF_CLUB,
        // courses.crs.properties.name,
        // courses.features[loop].properties.name,
        // courses.features[loop].properties.phoneNumber,
        // courses.features[loop].properties.photoTitle,
        // courses.features[loop].properties.photoUrl,
        // courses.features[loop].properties.description,
        // courses.features[loop].geometry.coordinates[0],
        // courses.features[loop].geometry.coordinates[1],
      ]

      const sql =
        "INSERT INTO seismicdesigns (seismicdesignsid, databaseversion) VALUES ($1, $2 )"

      getDb().run(sql, course, (err) => {
        if (err) {
          console.error(err.message)
        }
      })

      loop++
    } while (loop < courses.features.length)

    console.log("No of new Seismic Designs created & saved: ", loop)
  } catch (e) {
    console.error(e.message)
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Get all Seismic Designs from PostgreSQL database
// Path: localhost:4000/api/seismicdesigns/getSeismicDesigns
// -------------------------------------------------------
export const getSeismicDesigns = async (req, res) => {
  try {
    const sql = "SELECT * FROM seismicdesigns ORDER BY seismicdesignid"
    const results = await getDb().all(sql)

    res.send(results)
  } catch (error) {
    console.error("Error in getSeismicDesigns:", error.message)
    res.status(500).send({ error: "Failed to fetch Seismic Designs" })
  }
}

export default getSeismicDesigns
