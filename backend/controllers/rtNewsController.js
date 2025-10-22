import fs from "fs"
import axios from "axios"
// import moment from "moment"
import { DatabaseAdapter } from "../databaseUtilities.js"

// Database adapter for PostgreSQL
const db = new DatabaseAdapter()

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
export const prepareEmptyRTNewsTable = async (req, res) => {
  try {
    // Check if rtnews table exists using PostgreSQL system tables
    const tableExists = await db.get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'rtnews'
      )`
    )

    if (tableExists.exists) {
      // If exists then delete all values
      console.log("rtnews table exists")
      await deleteRTNewsItems()
    } else {
      // Else create table
      console.log("rtnews table does not exist")
      await createRTNewsTable()
    }

    res.send({ message: "RTNews table prepared successfully" })
  } catch (error) {
    console.error("Error in prepareEmptyRTNewsTable:", error.message)
    res.status(500).send({ error: "Failed to prepare RTNews table" })
  }
}

// -------------------------------------------------------
// Local function to create empty RTNews Table in the database
// -------------------------------------------------------
const createRTNewsTable = async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS rtnews (
        itemid SERIAL PRIMARY KEY, 
        title TEXT NOT NULL, 
        author TEXT NOT NULL, 
        published_date TEXT NOT NULL, 
        published_date_precision TEXT NOT NULL, 
        link TEXT NOT NULL, 
        clean_url TEXT NOT NULL, 
        excerpt TEXT NOT NULL, 
        summary TEXT NOT NULL, 
        rights TEXT NOT NULL, 
        rank INTEGER, 
        topic TEXT NOT NULL, 
        country TEXT NOT NULL, 
        language TEXT NOT NULL, 
        authors TEXT NOT NULL, 
        media TEXT NOT NULL,
        is_opinion INTEGER, 
        twitter_account TEXT NOT NULL, 
        _score INTEGER, 
        _id TEXT
      )
    `

    await db.run(sql)
    console.log("Empty rtNews table created")
  } catch (error) {
    console.error("Error in createRTNewsTable:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Local function to delete all RTNewsItems records from Table in database
// -------------------------------------------------------
const deleteRTNewsItems = async () => {
  try {
    // Count the records in the database
    const countResult = await db.get(
      "SELECT COUNT(itemid) AS count FROM rtnews"
    )

    if (countResult && countResult.count > 0) {
      // Delete all the data in the rtnews table
      await db.run("DELETE FROM rtnews")
      console.log("All rtnews data deleted")

      // Reset the sequence (PostgreSQL equivalent of sqlite_sequence)
      await db.run("ALTER SEQUENCE rtnews_itemid_seq RESTART WITH 1")
      console.log("RTNews ID sequence reset to 1")
    } else {
      console.log("rtnews table was empty (so no data deleted)")
    }
  } catch (error) {
    console.error("Error in deleteRTNewsItems:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Import RTNews Items from a File to the Table in the Database
// Path: localhost:4000/api/rtnews/importRTNewsItemsFromFile
// -------------------------------------------------------
export const importRTNewsItemsFromFile = async (req, res) => {
  try {
    // Fetch all the RTNews events
    const data = await fs.promises.readFile(
      process.env.RAW_RTNEWS_DATA_FILEPATH,
      "utf8"
    )

    // Save the data in the rtnews Table in the PostgreSQL database
    const newsItems = JSON.parse(data)
    await populateRTNewsTable(newsItems)

    res.send({ message: "RTNews items imported successfully" })
  } catch (error) {
    console.error("Error in importRTNewsItemsFromFile:", error.message)
    res.status(500).send({ error: "Failed to import RTNews items" })
  }
}

// -------------------------------------------------------
// Local function for importRTNewsItemsFromFile
// -------------------------------------------------------
const populateRTNewsTable = async (newsItems) => {
  try {
    let insertedCount = 0

    for (const newsItem of newsItems.items) {
      const item = [
        newsItem.itemid,
        newsItem.title,
        newsItem.author,
        newsItem.published_date,
        newsItem.published_date_precision,
        newsItem.link,
        newsItem.clean_url,
        newsItem.excerpt,
        newsItem.summary,
        newsItem.rights,
        newsItem.rank,
        newsItem.topic,
        newsItem.country,
        newsItem.language,
        newsItem.authors,
        newsItem.media,
        newsItem.is_opinion,
        newsItem.twitter_account,
        newsItem._score,
        newsItem._id,
      ]

      const sql = `
        INSERT INTO rtnews (itemid, title, author, published_date, published_date_precision, 
                           link, clean_url, excerpt, summary, rights, rank, topic, country, 
                           language, authors, media, is_opinion, twitter_account, _score, _id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      await db.run(sql, item)
      insertedCount++
    }

    console.log("No of new News Items created & saved:", insertedCount)
    return insertedCount
  } catch (error) {
    console.error("Error in populateRTNewsTable:", error.message)
    throw error
  }
}

// -------------------------------------------------------
// Get all Real Time News Items from PostgreSQL database
// Path: localhost:4000/api/rtnews/getRTNewsItems
// -------------------------------------------------------
export const getRTNewsItems = async (req, res) => {
  try {
    const sql = "SELECT * FROM rtnews ORDER BY itemid"
    const results = await db.all(sql)

    res.send(results)
  } catch (error) {
    console.error("Error in getRTNewsItems:", error.message)
    res.status(500).send({ error: "Failed to fetch RTNews items" })
  }
}

// -------------------------------------------------------
// Get all Real Time News Items from News API
// Path: localhost:4000/api/rtnews/getNewsItems
// -------------------------------------------------------
export const getNewsHeadlinesItems = async (liveNewsTopHeadlinesUrl) => {
  return await axios
    .get(liveNewsTopHeadlinesUrl, {
      params: {
        pageSize: 5, // Fetch 5 items
      },
    })
    .then((response) => response.data.articles)
    .catch((error) => console.log("Error in getAndSaveRTNewsData: ", error))
}

// -------------------------------------------------------
// Socket Emit news headlines data to be consumed by the client
// -------------------------------------------------------
export const emitNewsHeadlinesData = (
  socket,
  newsHeadlinesData,
  stillLoading
) => {
  // Guard clauses
  if (socket == null) return
  if (newsHeadlinesData == null) return
  if (stillLoading == null) return

  try {
    socket.emit("FromNewsHeadlinesAPI", newsHeadlinesData)
    socket.emit("FromIsLoadingNewsHeadlinesData", stillLoading)
  } catch (error) {
    console.log("Error in emitNewsHeadlinesData: ", error)
  }
}

export default getRTNewsItems
