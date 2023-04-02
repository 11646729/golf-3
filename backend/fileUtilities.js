import fs from "fs"
import path from "path"
import sqlite3 from "sqlite3"

sqlite3.verbose()

// -------------------------------------------------------
// Local function to read the geojson filenames in a directory
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
// Local function to read a Route file
// -------------------------------------------------------
export var readRouteFile = (fileUrl) => {
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
  if (url === null) {
    console.log("Invalid Database url")
    return
  }

  let db = null
  if (process.env.NODE_ENV === "production") {
    // PostgreSQL in production
    // TODO
    //
  } else if (process.env.NODE_ENV === "development") {
    // SQLite by default
    db = new sqlite3.Database(url)

    if (db !== null) {
      // console.log("Connected to the SQLite database")
      return db
    } else {
      console.log("UNSUCCESSFUL in connecting to the SQLite database")
    }

    return db
  }
}

// -------------------------------------------------------
// Function to close the SQLite database connection
// -------------------------------------------------------
export var closeSqlDbConnection = (db) => {
  // Guard clause for null Database Connection
  if (db === null) {
    console.log("Database Connection not closed")
    return
  }

  db.close()
  // console.log("Disconnected from the SQLite database")
}
