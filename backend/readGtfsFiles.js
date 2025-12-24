import fs from "fs"
import path from "path"
import { parse } from "csv-parse"
import { DatabaseAdapter } from "./databaseUtilities.js"

const db = new DatabaseAdapter()

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
// Import Agency GTFS data into PostgreSQL
// -------------------------------------------------------
export async function importAgencyTxt(filePath) {
  const stats = { inserted: 0, skipped: 0, errors: 0 }
  const rows = []

  console.log(`Importing agency data from: ${filePath}`)

  // First, parse all rows
  await new Promise((resolve, reject) => {
    const parser = fs.createReadStream(filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      })
    )

    parser.on("data", (row) => {
      rows.push(row)
    })

    parser.on("end", () => {
      resolve()
    })

    parser.on("error", (error) => {
      console.error("Error parsing CSV:", error)
      reject(error)
    })
  })

  // Then, insert each row sequentially
  for (const row of rows) {
    try {
      // Validate required fields
      if (
        !row.agency_id ||
        !row.agency_name ||
        !row.agency_url ||
        !row.agency_timezone
      ) {
        console.warn(`Skipping row with missing required fields:`, row)
        stats.skipped++
        continue
      }

      // Insert into database with conflict handling
      const sql = `
        INSERT INTO agency (
          agency_id, agency_name, agency_url, agency_timezone, 
          agency_lang, agency_phone, agency_fare_url, agency_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (agency_id) DO NOTHING
      `

      const params = [
        row.agency_id,
        row.agency_name,
        row.agency_url,
        row.agency_timezone,
        row.agency_lang || null,
        row.agency_phone || null,
        row.agency_fare_url || null,
        row.agency_email || null,
      ]

      const result = await db.run(sql, params)

      if (result.changes > 0) {
        stats.inserted++
        console.log(`✓ Inserted: ${row.agency_name} (${row.agency_id})`)
      } else {
        stats.skipped++
        console.log(
          `⊘ Skipped (duplicate): ${row.agency_name} (${row.agency_id})`
        )
      }
    } catch (error) {
      console.error(`✗ Error inserting agency row:`, row, error.message)
      stats.errors++
    }
  }

  console.log("\n=== Import Summary ===")
  console.log(`Inserted: ${stats.inserted}`)
  console.log(`Skipped (duplicates): ${stats.skipped}`)
  console.log(`Errors: ${stats.errors}`)
  console.log("======================\n")

  return stats
}

export default readRouteFile
