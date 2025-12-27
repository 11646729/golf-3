import fs from "fs"
import {
  openSqlDbConnection,
  closeSqlDbConnection,
} from "../databaseUtilities.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/golf/
// -------------------------------------------------------
export var index = (req, res) => {
  res.send({ response: "Golf Route Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Prepare empty golfcourses Table ready to import data
// -------------------------------------------------------
export const createGolfCoursesTable = async (req, res) => {
  console.log("Preparing empty golfcourses table...")

  const db = await openSqlDbConnection()

  if (db !== null) {
    try {
      // Check if table exists
      await db.all("SELECT COUNT(*) as count FROM golfcourses")
      // Table exists, delete data
      console.log("golfcourses table exists")
      await deleteGolfCoursesData(db)
    } catch (err) {
      // Table doesn't exist, create it
      console.log("golfcourses table does not exist")
      await createGolfCoursesTableStructure(db)
    }
    res.send("Returned Data")
  } else {
    console.error("Cannot connect to database")
    res.status(500).json({ error: "Cannot connect to database" })
  }
}

// -------------------------------------------------------
// Create empty golfcourses Table in the database
// -------------------------------------------------------
const createGolfCoursesTableStructure = async (db) => {
  if (db === null) return

  const sql = `
    CREATE TABLE IF NOT EXISTS golfcourses (
      courseid SERIAL PRIMARY KEY, 
      version TEXT NOT NULL, 
      type TEXT NOT NULL, 
      crsurn TEXT NOT NULL, 
      name TEXT NOT NULL, 
      phonenumber TEXT NOT NULL, 
      phototitle TEXT NOT NULL, 
      photourl TEXT NOT NULL, 
      description TEXT, 
      lng REAL CHECK( lng >= -180 AND lng <= 180 ), 
      lat REAL CHECK( lat >= -90 AND lat <= 90 )
    )
  `

  try {
    await db.run(sql)
    console.log("Empty golfcourses table created")
  } catch (e) {
    console.error("Error in createGolfCoursesTableStructure: ", e.message)
  }
}

// -------------------------------------------------------
// Delete all golfcourses records from database
// -------------------------------------------------------
const deleteGolfCoursesData = async (db) => {
  if (db === null) return

  try {
    const result = await db.all(
      "SELECT COUNT(courseid) AS count FROM golfcourses"
    )

    if (result[0].count > 0) {
      await db.run("DELETE FROM golfcourses")
      console.log("All golfcourses data deleted")

      // Reset sequence for PostgreSQL
      try {
        await db.run("ALTER SEQUENCE golfcourses_courseid_seq RESTART WITH 1")
        console.log("Sequence reset")
      } catch (e) {
        // Ignore if sequence doesn't exist
      }
    } else {
      console.log("golfcourses table was empty (so no data deleted)")
    }
  } catch (err) {
    console.error("Error in deleteGolfCoursesData: ", err.message)
  }
}

// -------------------------------------------------------
// Import Golf Courses Data into Database
// -------------------------------------------------------
export const importGolfCoursesData = async (req, res) => {
  const db = await openSqlDbConnection()

  if (db === null) {
    res.status(500).json({ error: "Cannot connect to database" })
    return
  }

  try {
    const data = fs.readFileSync(
      process.env.RAW_GOLF_COURSE_DATA_FILEPATH,
      "utf8"
    )
    const courses = JSON.parse(data)
    await populateGolfCoursesTable(db, courses)
    res.send({ message: "Golf courses imported successfully" })
  } catch (err) {
    console.error("Error in importGolfCoursesData: ", err.message)
    res.status(500).json({ error: err.message })
  }
}

// -------------------------------------------------------
// Local function
// -------------------------------------------------------
const populateGolfCoursesTable = async (db, courses) => {
  const sql =
    "INSERT INTO golfcourses (version, type, crsurn, name, phonenumber, phototitle, photourl, description, lng, lat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

  try {
    for (let i = 0; i < courses.features.length; i++) {
      const feature = courses.features[i]
      const params = [
        process.env.DATABASE_VERSION,
        process.env.TYPE_GOLF_CLUB,
        courses.crs.properties.name,
        feature.properties.name,
        feature.properties.phoneNumber,
        feature.properties.photoTitle,
        feature.properties.photoUrl,
        feature.properties.description,
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
      ]
      await db.run(sql, params)
    }
    console.log(
      "No of new Golf Courses created & saved: ",
      courses.features.length
    )
  } catch (e) {
    console.error(e.message)
  }
}

// -------------------------------------------------------
// Get all Golf Courses from Database
// Path: localhost:4000/api/golf/getGolfCourses
// -------------------------------------------------------
export const getGolfCourses = async (req, res) => {
  const sql = "SELECT * FROM golfcourses ORDER BY courseid"

  // Open a Database Connection
  const db = await openSqlDbConnection()

  if (db !== null) {
    try {
      const results = await db.all(sql)
      res.send(results)
    } catch (e) {
      console.error(e.message)
      res.status(400).json({ error: e.message })
    }
  } else {
    console.error("Cannot connect to database")
    res.status(500).json({ error: "Cannot connect to database" })
  }
}

export default getGolfCourses
