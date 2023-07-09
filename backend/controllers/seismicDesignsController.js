// import fs from "fs"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

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
export const prepareEmptySeismicDesignsTable = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    // Firstly read the sqlite_schema table to check if golfcourses table exists
    let sql =
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'seismicdesigns'"

    // Must use db.all not db.run
    db.all(sql, [], (err, results) => {
      if (err) {
        return console.error(err.message)
      }

      // results.length shows 1 if exists or 0 if doesn't exist
      if (results.length === 1) {
        // If exists then delete all values
        console.log("seismicdesigns table exists")
        deleteSeismicDesigns(db)
      } else {
        // Else create table
        console.log("seismicdesigns table does not exist")
        createSeismicDesignsTable(db)
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
// Create seismicdesigns Table in the SQLite database
// -------------------------------------------------------
const createSeismicDesignsTable = (db) => {
  // IF NOT EXISTS isn't really necessary in next line
  const sql =
    "CREATE TABLE IF NOT EXISTS seismicdesigns (seismicdesignid INTEGER PRIMARY KEY AUTOINCREMENT, databaseversion INTEGER, type TEXT NOT NULL)"
  let params = []

  // Guard clause for null Database Connection
  if (db === null) return

  try {
    db.run(sql, params, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Empty seismicdesigns table created")
    })
  } catch (e) {
    console.error("Error in createSeismicDesignsTable: ", e.message)
  }
}

// -------------------------------------------------------
// Delete all seismicdesigns records from SQLite database
// -------------------------------------------------------
const deleteSeismicDesigns = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // db.serialize(function () {
    // Count the records in the database
    const sql = "SELECT COUNT(seismicdesignid) AS count FROM seismicdesigns"

    db.all(sql, [], (err, result) => {
      if (err) {
        console.error(err.message)
      }

      if (result[0].count > 0) {
        // Delete all the data in the seismicdesigns table
        const sql1 = "DELETE FROM seismicdesigns"

        db.all(sql1, [], function (err, results) {
          if (err) {
            console.error(err.message)
          }
          console.log("All seismicdesigns data deleted")
        })

        // Reset the id number
        const sql2 =
          "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'seismicdesigns'"

        db.run(sql2, [], (err) => {
          if (err) {
            console.error(err.message)
          }
          console.log(
            "In sqlite_sequence table seismicdesigns seq number set to 0"
          )
        })
      } else {
        console.log("seismicdesigns table was empty (so no data deleted)")
      }
      // })
    })
  } catch (err) {
    console.error("Error in deleteSeismicDesigns: ", err.message)
  }
}

// -------------------------------------------------------
// Import Seismic Designs Table in the SQLite Database
// Path: Function called in switchBoard
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
        "INSERT INTO seismicdesigns (seismicdesignsid, databaseversion) VALUES ($1, $2, $3 )"

      db.run(sql, course, (err) => {
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
// Get all Seismic Designs from SQLite database
// Path: localhost:4000/api/seismicdesigns/getSeismicDesigns
// -------------------------------------------------------
export const getSeismicDesigns = (req, res) => {
  let sql = "SELECT * FROM seismicdesigns ORDER BY seismicdesignsid"
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

export default getSeismicDesigns
