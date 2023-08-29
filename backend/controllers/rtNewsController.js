import fs from "fs"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/rtnews/
// -------------------------------------------------------
export var index = (req, res) => {
  res.send({ response: "Real Time News Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Prepare empty RTNews Table ready to import events
// Path: localhost:4000/api/rtnews/prepareEmptyRTNewsTable
// -------------------------------------------------------
export const prepareEmptyRTNewsTable = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  if (db !== null) {
    // Firstly read the sqlite_schema table to check if rtnews table exists
    let sql =
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'rtnews'"

    // Must use db.all not db.run
    db.all(sql, [], (err, results) => {
      if (err) {
        return console.error(err.message)
      }

      // results.length shows 1 if exists or 0 if doesn't exist
      if (results.length === 1) {
        // If exists then delete all values
        console.log("rtnews table exists")
        // deleteRTNewsItems(db)
      } else {
        // Else create table
        console.log("rtnews table does not exist")
        createRTNewsTable(db)
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
// Local function to create empty RTNews Table in the database
// -------------------------------------------------------
const createRTNewsTable = (db) => {
  // IF NOT EXISTS isn't really necessary in next line
  const sql =
    "CREATE TABLE IF NOT EXISTS rtnews (itemid INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL, published_date TEXT NOT NULL, published_date_precision TEXT NOT NULL, link TEXT NOT NULL, clean_url TEXT NOT NULL, excerpt TEXT NOT NULL, summary TEXT NOT NULL, rights TEXT NOT NULL, rank INTEGER, topic TEXT NOT NULL, country TEXT NOT NULL, language TEXT NOT NULL, authors TEXT NOT NULL, media TEXT NOT NULL,is_opinion INTEGER, twitter_account TEXT NOT NULL, _score INTEGER, _id TEXT)"

  // "2021-07-26 16:42:51"

  let params = []

  // Guard clause for null Database Connection
  if (db === null) return

  try {
    db.run(sql, params, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log("Empty rtNews table created")
    })
  } catch (e) {
    console.error("Error in createRTNewsTable: ", e.message)
  }
}

// -------------------------------------------------------
// Local function to delete all RTNewsItems records from Table in database
// -------------------------------------------------------
const deleteRTNewsItems = (db) => {}

// -------------------------------------------------------
// Import RTNews Items from a File to the Table in the Database
// Path: localhost:4000/api/rtnews/importRTNewsItemsFromFile
// -------------------------------------------------------
export const importRTNewsItemsFromFile = (req, res) => {}

// -------------------------------------------------------
// Local function for importRTNewsItemsFromFile
// -------------------------------------------------------
const populateRTNewsTable = (events) => {}

// -------------------------------------------------------
// Get all Real Time News Items from SQLite database
// Path: localhost:4000/api/rtnews/getRTNewsItems
// -------------------------------------------------------
export const getRTNewsItems = (req, res) => {
  console.log("Here")
  // return dummyNewsEvents
}

export default getRTNewsItems
