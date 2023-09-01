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
        deleteRTNewsItems(db)
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
const deleteRTNewsItems = (db) => {
  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // db.serialize(function () {
    // Count the records in the database
    const sql = "SELECT COUNT(itemid) AS count FROM rtnews"

    db.all(sql, [], (err, result) => {
      if (err) {
        console.error(err.message)
      }

      if (result[0].count > 0) {
        // Delete all the data in the rtnews table
        const sql1 = "DELETE FROM rtcalendar"

        db.all(sql1, [], function (err, results) {
          if (err) {
            console.error(err.message)
          }
          console.log("All rtnews data deleted")
        })

        // Reset the id number
        const sql2 = "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'rtnews'"

        db.run(sql2, [], (err) => {
          if (err) {
            console.error(err.message)
          }
          console.log("In sqlite_sequence table rtnews seq number set to 0")
        })
      } else {
        console.log("rtnews table was empty (so no data deleted)")
      }
      // })
    })
  } catch (err) {
    console.error("Error in deleteRTNewsItems: ", err.message)
  }
}

// -------------------------------------------------------
// Import RTNews Items from a File to the Table in the Database
// Path: localhost:4000/api/rtnews/importRTNewsItemsFromFile
// -------------------------------------------------------
export const importRTNewsItemsFromFile = (req, res) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  // Guard clause for null Database Connection
  if (db === null) return

  try {
    // Fetch all the RTNews events
    fs.readFile(process.env.RAW_RTNEWS_DATA_FILEPATH, "utf8", (err, data) => {
      if (err) {
        console.error(err.message)
      }

      // Save the data in the rtnews Table in the SQLite database
      const newsItems = JSON.parse(data)
      populateRTNewsTable(newsItems)
    })
  } catch (err) {
    console.error("Error in importRTNewsItemsFromFile: ", err.message)
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Local function for importRTNewsItemsFromFile
// -------------------------------------------------------
const populateRTNewsTable = (newsItems) => {
  // Open a Database Connection
  let db = null
  db = openSqlDbConnection(process.env.SQL_URI)

  let loop = 0
  try {
    do {
      const item = [
        // process.env.DATABASE_VERSION,
        newsItems.items[loop].itemid,
        newsItems.items[loop].title,
        newsItems.items[loop].author,
        newsItems.items[loop].published_date,
        newsItems.items[loop].published_date_precision,
        newsItems.items[loop].link,
        newsItems.items[loop].clean_url,
        newsItems.items[loop].excerpt,
        newsItems.items[loop].summary,
        newsItems.items[loop].rights,
        newsItems.items[loop].rank,
        newsItems.items[loop].topic,
        newsItems.items[loop].country,
        newsItems.items[loop].language,
        newsItems.items[loop].authors,
        newsItems.items[loop].media,
        newsItems.items[loop].is_opinion,
        newsItems.items[loop].twitter_account,
        newsItems.items[loop]._score,
        newsItems.items[loop]._id,
      ]

      const sql =
        "INSERT INTO rtnews (itemid, title, author, published_date, published_date_precision, link, clean_url, excerpt, summary, rights, rank, topic, country, language, authors, media, is_opinion, twitter_account, _score, _id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20 )"

      db.run(sql, item, (err) => {
        if (err) {
          console.error(err.message)
        }
      })

      loop++
    } while (loop < newsItems.items.length)

    console.log("No of new News Items created & saved: ", loop)
  } catch (e) {
    console.error(e.message)
  }

  // Close the Database Connection
  closeSqlDbConnection(db)
}

// -------------------------------------------------------
// Get all Real Time News Items from SQLite database
// Path: localhost:4000/api/rtnews/getRTNewsItems
// -------------------------------------------------------
export const getRTNewsItems = (req, res) => {
  let sql = "SELECT * FROM rtnews ORDER BY itemid"
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

export default getRTNewsItems
