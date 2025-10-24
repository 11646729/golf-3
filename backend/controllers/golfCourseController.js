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
export const prepareEmptyGolfCoursesTable = async (req, res) => {
  // Open a Database Connection
  let db = null
  db = await openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    // Simple SELECT to check if table exists (works for both databases)
    let sql = "SELECT COUNT(*) as count FROM golfcourses"

    db.all(sql, [], (err, results) => {
      if (err) {
        // Table doesn't exist, create it
        console.log("golfcourses table does not exist")
        createGolfCoursesTable(db)
      } else {
        // Table exists, delete data
        console.log("golfcourses table exists")
        deleteGolfCoursesData(db)
      }
    })

    res.send("Returned Data")
  } else {
    console.error("Cannot connect to database")
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Create empty golfcourses Table in the database
// -------------------------------------------------------
const createGolfCoursesTable = (db) => {
  // PostgreSQL and SQLite compatible table creation
  const sql = `
    CREATE TABLE IF NOT EXISTS golfcourses (
      courseid SERIAL PRIMARY KEY, 
      databaseversion TEXT NOT NULL, 
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
  let params = []

  // Guard clause for null Database Connection
  if (db === null) return

  try {
    db.run(sql, params, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Empty golfcourses table created")
    })
  } catch (e) {
    console.error("Error in createGolfCoursesTable: ", e.message)
  }
}

// -------------------------------------------------------
// Delete all golfcourses records from database
// -------------------------------------------------------
const deleteGolfCoursesData = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // Count the records in the database
    const sql = "SELECT COUNT(courseid) AS count FROM golfcourses"

    db.all(sql, [], (err, result) => {
      if (err) {
        console.error(err.message)
      }

      if (result[0].count > 0) {
        // Delete all the data in the golfcourses table
        const sql1 = "DELETE FROM golfcourses"

        db.all(sql1, [], function (err, results) {
          if (err) {
            console.error(err.message)
          }
          console.log("All golfcourses data deleted")
        })

        // Reset sequence for PostgreSQL or SQLite
        const sql2 = `
          UPDATE sqlite_sequence SET seq = 0 WHERE name = 'golfcourses';
          ALTER SEQUENCE golfcourses_courseid_seq RESTART WITH 1;
        `

        db.run(sql2, [], (err) => {
          if (err) {
            // Don't log error as one of the statements will fail depending on DB type
            console.log("Sequence reset attempted")
          }
        })
      } else {
        console.log("golfcourses table was empty (so no data deleted)")
      }
    })
  } catch (err) {
    console.error("Error in deleteGolfCoursesData: ", err.message)
  }
}

// -------------------------------------------------------
// Import Golf Courses Table in the SQLite Database
// -------------------------------------------------------
export const importGolfCoursesData = async (req, res) => {
  // Open a Database Connection
  let db = null
  db = await openSqlDbConnection(process.env.SQL_URI)

  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // Fetch all the Golf Courses data
    fs.readFile(
      process.env.RAW_GOLF_COURSE_DATA_FILEPATH,
      "utf8",
      (err, data) => {
        if (err) {
          console.error(err.message)
        }

        // Save the data in the golfcourses Table in the database
        const courses = JSON.parse(data)

        populateGolfCoursesTable(courses)
      }
    )
  } catch (err) {
    console.error("Error in importGolfCoursesData: ", err.message)
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Local function
// -------------------------------------------------------
const populateGolfCoursesTable = async (courses) => {
  // Open a Database Connection
  let db = null
  db = await openSqlDbConnection(process.env.SQL_URI)

  let loop = 0
  try {
    do {
      // Skip courseid for PostgreSQL (uses SERIAL), include for SQLite compatibility
      const course = [
        process.env.DATABASE_VERSION,
        process.env.TYPE_GOLF_CLUB,
        courses.crs.properties.name,
        courses.features[loop].properties.name,
        courses.features[loop].properties.phoneNumber,
        courses.features[loop].properties.photoTitle,
        courses.features[loop].properties.photoUrl,
        courses.features[loop].properties.description,
        courses.features[loop].geometry.coordinates[0],
        courses.features[loop].geometry.coordinates[1],
      ]

      // Use placeholder syntax that works with both databases
      const sql =
        "INSERT INTO golfcourses (databaseversion, type, crsurn, name, phonenumber, phototitle, photourl, description, lng, lat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

      db.run(sql, course, (err) => {
        if (err) {
          console.error("Here: " + err.message)
        }
      })

      loop++
    } while (loop < courses.features.length)

    console.log("No of new Golf Courses created & saved: ", loop)
  } catch (e) {
    console.error(e.message)
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Get all Golf Courses from SQLite database
// Path: localhost:4000/api/golf/getGolfCourses
// -------------------------------------------------------
export const getGolfCourses = async (req, res) => {
  let sql = "SELECT * FROM golfcourses ORDER BY courseid"
  let params = []

  // Open a Database Connection
  let db = null
  db = await openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    try {
      db.all(sql, params, (err, results) => {
        if (err) {
          res.status(400).json({ error: err.message })
          return
        }
        res.send(results)

        // Put socket.emit here
        // console.log(results)
      })

      // Close the Database Connection
      closeSqlDbConnection(db)
    } catch (e) {
      console.error(e.message)
    }
  } else {
    console.error("Cannot connect to database")
  }
}

export default getGolfCourses
