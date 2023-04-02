import fs from "fs"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

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
export const prepareEmptyGolfCoursesTable = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    // Firstly read the sqlite_schema table to check if golfcourses table exists
    let sql =
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'golfcourses'"

    // Must use db.all not db.run
    db.all(sql, [], (err, results) => {
      if (err) {
        return console.error(err.message)
      }

      // results.length shows 1 if exists or 0 if doesn't exist
      if (results.length === 1) {
        // If exists then delete all values
        console.log("golfcourses table exists")
        deleteGolfCourses(db)
      } else {
        // Else create table
        console.log("golfcourses table does not exist")
        createGolfCoursesTable(db)
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
// Create golfcourses Table in the SQLite database
// -------------------------------------------------------
const createGolfCoursesTable = (db) => {
  // IF NOT EXISTS isn't really necessary in next line
  const sql =
    "CREATE TABLE IF NOT EXISTS golfcourses (courseid INTEGER PRIMARY KEY AUTOINCREMENT, databaseversion INTEGER, type TEXT NOT NULL, crsurn TEXT NOT NULL, name TEXT NOT NULL, phonenumber TEXT NOT NULL, phototitle TEXT NOT NULL, photourl TEXT NOT NULL, description TEXT, lng REAL CHECK( lng >= -180 AND lng <= 180 ), lat REAL CHECK( lat >= -90 AND lat <= 90 ))"
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
// Delete all golfcourses records from SQLite database
// -------------------------------------------------------
const deleteGolfCourses = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // db.serialize(function () {
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

        // Reset the id number
        const sql2 =
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'golfcourses'"

        db.run(sql2, [], (err) => {
          if (err) {
            console.error(err.message)
          }
          console.log(
            "In sqlite_sequence table golfcourses seq number set to 0"
          )
        })
      } else {
        console.log("golfcourses table was empty (so no data deleted)")
      }
      // })
    })
  } catch (err) {
    console.error("Error in deleteGolfCourses: ", err.message)
  }
}

// -------------------------------------------------------
// Create Golf Courses Table in the SQLite Database
// Path: Function called in switchBoard
// -------------------------------------------------------
export const importGolfCoursesData = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

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

        // Save the data in the golfcourses Table in the SQLite database
        const courses = JSON.parse(data)
        populateGolfCourses(courses)
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
const populateGolfCourses = (courses) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  let loop = 0
  try {
    do {
      // courseid == loop
      const course = [
        loop,
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

      const sql =
        "INSERT INTO golfcourses (courseid, databaseversion, type, crsurn, name, phonenumber, phototitle, photourl, description, lng, lat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )"

      db.run(sql, course, (err) => {
        if (err) {
          console.error(err.message)
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
export const getGolfCourses = (req, res) => {
  let sql = "SELECT * FROM golfcourses ORDER BY courseid"
  let params = []

  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    try {
      db.all(sql, params, (err, results) => {
        if (err) {
          res.status(400).json({ error: err.message })
          return
        }
        // res.json({
        //   message: "success",
        //   data: results,
        // })
        res.send(results)
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
