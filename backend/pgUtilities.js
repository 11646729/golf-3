import fs from "fs"
import path from "path"
import pg from "pg"

// Module-level singleton connection pool to avoid repeated connections
let pooledClient = null

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
// Function to open the PostgreSQL database connection
// -------------------------------------------------------
export var openDbConnection = (url) => {
  // Guard clause for null Database Url
  if (!url) {
    console.log("Invalid Database url")
    return null
  }

  // If we already have a pooled connection return it (singleton)
  if (pooledClient) return pooledClient

  try {
    // Create PostgreSQL client
    const client = new pg.Client(url)

    // Connect to the database
    client
      .connect()
      .then(() => {
        console.log("Connected to PostgreSQL database")
      })
      .catch((err) => {
        console.error("Failed to connect to PostgreSQL database:", err.message)
      })

    pooledClient = client
    return pooledClient
  } catch (err) {
    console.error(
      "UNSUCCESSFUL in connecting to the PostgreSQL database",
      err?.message || err
    )
    return null
  }
}

// Legacy function name for backward compatibility
export var openSqlDbConnection = openDbConnection

// -------------------------------------------------------
// Function to close the PostgreSQL database connection
// -------------------------------------------------------
export var closeDbConnection = (client) => {
  // Guard clause for null Database Connection
  if (!client) {
    // nothing to do
    return
  }

  // If client is the pooled connection, don't close it (reuse across app lifetime)
  if (pooledClient && client === pooledClient) {
    // No-op: pooled connection is intended to live for the app lifetime
    return
  }

  try {
    client.end()
  } catch (e) {
    console.warn("Error closing database connection:", e?.message || e)
  }
}

// Legacy function name for backward compatibility
export var closeSqlDbConnection = closeDbConnection

export default readRouteFile
