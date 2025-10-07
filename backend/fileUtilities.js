import fs from "fs"
import path from "path"
import sqlite3 from "sqlite3"

sqlite3.verbose()

// Module-level singleton DB to avoid repeated open/close and reduce locking
let pooledDb = null

// -------------------------------------------------------
// Function to read the geojson filenames in a directory
// -------------------------------------------------------
export var readRouteDirectory = (dirPath, suffix) => {
  try {
    let fileArray = []

    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
      if (path.extname(file).toLowerCase() === suffix) fileArray.push(file)
    })
    return fileArray
  } catch (err) {
    throw err
  }
}

// -------------------------------------------------------
// Function to read a Route file
// -------------------------------------------------------
export const readRouteFile = (fileUrl) => {
  try {
    // Firstly read all existing Bus Stops in the file
    const data = fs.readFileSync(fileUrl, "utf8")

    return JSON.parse(data)
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("File not found!")
    } else {
      throw err
    }
  }
}

// -------------------------------------------------------
// Local function to read a set of files in a directory
// -------------------------------------------------------
export var prepReadGtfsFile = (firstFile, iterationSize, arraylength) => {
  let fileFetchArray = []
  let fileFetch = []

  // Divide into pieces to prevent timeout error
  let loop = 0
  let start = 0
  let startIteration = firstFile // fileFetch[0]
  let endIteration = 0 // fileFetch[1]
  let end = arraylength // fileFetch[2]
  let noOfIterations = Math.floor(end / iterationSize)

  if (noOfIterations > 0) {
    do {
      if (loop === 0) {
        startIteration = start
        endIteration = iterationSize - 1
      } else {
        startIteration = loop * iterationSize
        if (loop < noOfIterations) {
          endIteration = (loop + 1) * iterationSize - 1
        } else {
          endIteration = end - 1
        }
      }

      loop++

      fileFetch.push(startIteration)
      fileFetch.push(endIteration)
      fileFetch.push(noOfIterations)

      fileFetchArray.push(fileFetch)

      fileFetch = []
    } while (loop <= noOfIterations)
  } else {
    startIteration = start
    endIteration = end - 1

    fileFetch.push(startIteration)
    fileFetch.push(endIteration)
    fileFetch.push(noOfIterations)

    fileFetchArray.push(fileFetch)
  }

  return fileFetchArray
}

// -------------------------------------------------------
// Function to open the SQLite database file connection
// -------------------------------------------------------
export var openSqlDbConnection = (url) => {
  // Guard clause for null Database Url
  if (!url) {
    console.log("Invalid Database url")
    return null
  }

  // If we already have a pooled DB connection return it (singleton)
  if (pooledDb) return pooledDb

  try {
    // Open a connection (non-production: SQLite)
    const db = new sqlite3.Database(url, (err) => {
      if (err) {
        console.error("Failed to open SQLite database:", err.message)
      }
    })

    // Configure to reduce busy/lock errors
    try {
      // busy timeout tells SQLite how long to wait for locks
      if (typeof db.configure === "function") {
        db.configure("busyTimeout", 5000)
      }
    } catch (e) {
      // ignore if not supported
    }

    // Use WAL journal mode to allow concurrent readers and writers
    db.run("PRAGMA journal_mode = WAL;", [], (err) => {
      if (err) console.warn("Could not set WAL journal mode:", err.message)
    })
    // Use NORMAL synchronous for a reasonable balance
    db.run("PRAGMA synchronous = NORMAL;", [], (err) => {
      if (err) console.warn("Could not set synchronous PRAGMA:", err.message)
    })

    pooledDb = db
    // console.log('Connected to the SQLite database (pooled)')
    return pooledDb
  } catch (err) {
    console.error(
      "UNSUCCESSFUL in connecting to the SQLite database",
      err?.message || err
    )
    return null
  }
}

// -------------------------------------------------------
// Function to close the SQLite database connection
// -------------------------------------------------------
export var closeSqlDbConnection = (db) => {
  // Guard clause for null Database Connection
  if (!db) {
    // nothing to do
    return
  }

  // If db is the pooled connection, don't close it (reuse across app lifetime)
  if (pooledDb && db === pooledDb) {
    // No-op: pooled connection is intended to live for the app lifetime
    return
  }

  try {
    db.close()
  } catch (e) {
    console.warn("Error closing database connection:", e?.message || e)
  }
}

export default readRouteFile
