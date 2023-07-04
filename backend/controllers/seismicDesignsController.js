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
