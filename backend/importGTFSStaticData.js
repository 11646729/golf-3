import fs from "fs"
import path from "path"
import { parse } from "csv-parse"
import { from as copyFrom } from "pg-copy-streams"
import { pipeline } from "stream/promises"
import { Transform } from "stream"
import dotenv from "dotenv"
import { DatabaseAdapter, createDatabaseAdapter } from "./databaseUtilities.js"
import { createGTFSTables } from "./createGTFSTables/createGTFSTables.js"
import readRouteFile from "./readGtfsFiles.js"

// Load environment variables when running as standalone script
if (process.argv[1] === new URL(import.meta.url).pathname) {
  dotenv.config()
}

const db = new DatabaseAdapter()

const defaultConfigPath = new URL(
  "./gtfs_config_files/configTransportForIrelandPostgres.json",
  import.meta.url,
).pathname

const csvOptions = {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true,
}

const toNull = (value) => {
  if (value === undefined || value === null) return null
  const text = `${value}`.trim()
  return text === "" ? null : text
}

const toInt = (value) => {
  const text = toNull(value)
  if (text === null) return null
  const parsed = parseInt(text, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const toNumber = (value) => {
  const text = toNull(value)
  if (text === null) return null
  const parsed = parseFloat(text)
  return Number.isNaN(parsed) ? null : parsed
}

const toGtfsDate = (value) => {
  const text = toNull(value)
  if (text === null) return null
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
  }
  return text
}

const streamCsvRows = async (filePath, onRow) => {
  const parser = fs.createReadStream(filePath).pipe(parse(csvOptions))

  for await (const row of parser) {
    await onRow(row)
  }
}

/**
 * Import using PostgreSQL COPY command for faster bulk inserts
 * @param {Object} options
 * @param {string} options.filePath - Path to CSV file
 * @param {string} options.tableName - Target table name
 * @param {string[]} options.columns - Column names in order
 * @param {Function} options.mapRow - Function to transform row values
 */
const importFileWithCopy = async ({ filePath, tableName, columns, mapRow }) => {
  const stats = { inserted: 0, skipped: 0, errors: 0 }

  if (!fs.existsSync(filePath)) {
    console.warn(`File not found, skipping: ${filePath}`)
    return stats
  }

  const adapter = await createDatabaseAdapter()
  const client = adapter.client

  // Create COPY command with conflict handling via temporary table
  const tempTable = `temp_${tableName}_${Date.now()}`

  try {
    // Create temporary table
    await client.query(`
      CREATE TEMP TABLE ${tempTable} (LIKE ${tableName} INCLUDING DEFAULTS)
    `)

    // COPY into temporary table using TEXT format with tab delimiter
    const copyQuery = `COPY ${tempTable} (${columns.join(
      ", ",
    )}) FROM STDIN WITH (FORMAT text, NULL '\\N', DELIMITER E'\\t')`
    const stream = client.query(copyFrom(copyQuery))

    // Transform CSV rows to PostgreSQL TEXT format
    const transformStream = new Transform({
      objectMode: true,
      transform(row, encoding, callback) {
        try {
          const params = mapRow(row)
          if (!params) {
            stats.skipped += 1
            callback()
            return
          }

          // Convert to TEXT row: escape values and join with tabs
          const textRow =
            params
              .map((val) => {
                if (val === null || val === undefined) return "\\N"
                // Escape special characters for PostgreSQL TEXT format
                const str = String(val)
                return str
                  .replace(/\\/g, "\\\\")
                  .replace(/\t/g, "\\t")
                  .replace(/\n/g, "\\n")
                  .replace(/\r/g, "\\r")
              })
              .join("\t") + "\n"

          callback(null, textRow)
        } catch (error) {
          stats.errors += 1
          console.error(
            `Failed to transform row from ${path.basename(filePath)}:`,
            error.message,
          )
          callback()
        }
      },
    })

    // Create CSV parser
    const csvStream = fs.createReadStream(filePath).pipe(parse(csvOptions))

    // Pipeline: CSV -> Transform -> COPY
    await pipeline(csvStream, transformStream, stream)

    // Insert from temp table to main table with conflict handling
    const result = await client.query(`
      INSERT INTO ${tableName} (${columns.join(", ")})
      SELECT ${columns.join(", ")} FROM ${tempTable}
      ON CONFLICT DO NOTHING
    `)

    stats.inserted = result.rowCount || 0

    // Drop temporary table
    await client.query(`DROP TABLE ${tempTable}`)
  } catch (error) {
    stats.errors += 1
    console.error(
      `Failed to import ${path.basename(filePath)} using COPY:`,
      error.message,
    )

    // Try to clean up temp table
    try {
      await client.query(`DROP TABLE IF EXISTS ${tempTable}`)
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }

  return stats
}

// Fallback to row-by-row for small files or when COPY fails
const importFile = async ({ filePath, mapRow, insertSql }) => {
  const stats = { inserted: 0, skipped: 0, errors: 0 }

  if (!fs.existsSync(filePath)) {
    console.warn(`File not found, skipping: ${filePath}`)
    return stats
  }

  await streamCsvRows(filePath, async (row) => {
    const params = mapRow(row)

    if (!params) {
      stats.skipped += 1
      return
    }

    try {
      const result = await db.run(insertSql, params)
      if (result.changes > 0) {
        stats.inserted += 1
      } else {
        stats.skipped += 1
      }
    } catch (error) {
      stats.errors += 1
      console.error(`Failed to insert row from ${path.basename(filePath)}`, {
        row,
        error: error.message,
      })
    }
  })

  return stats
}

const logFileResult = (fileName, stats) => {
  console.log(
    `Finished ${fileName}: ${stats.inserted} rows added, ${stats.skipped} skipped, ${stats.errors} errors.`,
  )
}

const getGtfsDirectory = (customPath) => {
  if (customPath) return customPath

  const configPath =
    process.env.TRANSPORT_FOR_IRELAND_FILEPATH || defaultConfigPath

  const config = readRouteFile(configPath)
  const gtfsPath = config?.agencies?.[0]?.path

  if (!gtfsPath) {
    throw new Error("GTFS directory could not be determined from config")
  }

  return gtfsPath
}

const importAgency = async (dir) => {
  const filePath = path.join(dir, "agency.txt")
  const columns = [
    "agency_id",
    "agency_name",
    "agency_url",
    "agency_timezone",
    "agency_lang",
    "agency_phone",
    "agency_fare_url",
    "agency_email",
    "cemv_support",
  ]

  return importFileWithCopy({
    filePath,
    tableName: "agency",
    columns,
    mapRow: (row) => {
      if (!row.agency_id || !row.agency_name || !row.agency_url) return null

      return [
        toNull(row.agency_id),
        toNull(row.agency_name),
        toNull(row.agency_url),
        toNull(row.agency_timezone),
        toNull(row.agency_lang),
        toNull(row.agency_phone),
        toNull(row.agency_fare_url),
        toNull(row.agency_email),
        toInt(row.cemv_support),
      ]
    },
  })
}

const importStops = async (dir) => {
  const filePath = path.join(dir, "stops.txt")
  const columns = [
    "stop_id",
    "stop_code",
    "stop_name",
    "tts_stop_name",
    "stop_desc",
    "stop_lat",
    "stop_lon",
    "zone_id",
    "stop_url",
    "location_type",
    "parent_station",
    "stop_timezone",
    "wheelchair_boarding",
    "level_id",
    "platform_code",
    "stop_access",
  ]

  return importFileWithCopy({
    filePath,
    tableName: "stops",
    columns,
    mapRow: (row) => {
      if (!row.stop_id) return null

      return [
        toNull(row.stop_id),
        toNull(row.stop_code),
        toNull(row.stop_name),
        toNull(row.tts_stop_name),
        toNull(row.stop_desc),
        toNumber(row.stop_lat),
        toNumber(row.stop_lon),
        toNull(row.zone_id),
        toNull(row.stop_url),
        toInt(row.location_type),
        toNull(row.parent_station),
        toNull(row.stop_timezone),
        toInt(row.wheelchair_boarding),
        toNull(row.level_id),
        toNull(row.platform_code),
        toInt(row.stop_access),
      ]
    },
  })
}

const importRoutes = async (dir) => {
  const filePath = path.join(dir, "routes.txt")
  const columns = [
    "route_id",
    "agency_id",
    "route_short_name",
    "route_long_name",
    "route_desc",
    "route_type",
    "route_url",
    "route_color",
    "route_text_color",
    "route_sort_order",
    "continuous_pickup",
    "continuous_drop_off",
    "network_id",
  ]

  return importFileWithCopy({
    filePath,
    tableName: "routes",
    columns,
    mapRow: (row) => {
      if (!row.route_id || !row.route_type) return null

      return [
        toNull(row.route_id),
        toNull(row.agency_id),
        toNull(row.route_short_name),
        toNull(row.route_long_name),
        toNull(row.route_desc),
        toInt(row.route_type),
        toNull(row.route_url),
        toNull(row.route_color),
        toNull(row.route_text_color),
        toInt(row.route_sort_order),
        toInt(row.continuous_pickup),
        toInt(row.continuous_drop_off),
        toNull(row.network_id),
      ]
    },
  })
}

const importTrips = async (dir) => {
  const filePath = path.join(dir, "trips.txt")
  const columns = [
    "trip_id",
    "route_id",
    "service_id",
    "trip_headsign",
    "trip_short_name",
    "direction_id",
    "block_id",
    "shape_id",
  ]

  return importFileWithCopy({
    filePath,
    tableName: "trips",
    columns,
    mapRow: (row) => {
      if (!row.trip_id || !row.route_id || !row.service_id) return null

      return [
        toNull(row.trip_id),
        toNull(row.route_id),
        toNull(row.service_id),
        toNull(row.trip_headsign),
        toNull(row.trip_short_name),
        toInt(row.direction_id),
        toNull(row.block_id),
        toNull(row.shape_id),
      ]
    },
  })
}

const importStopTimes = async (dir) => {
  const filePath = path.join(dir, "stop_times.txt")
  const columns = [
    "trip_id",
    "arrival_time",
    "departure_time",
    "stop_id",
    "stop_sequence",
    "stop_headsign",
    "pickup_type",
    "drop_off_type",
    "continuous_pickup",
    "continuous_drop_off",
    "shape_dist_traveled",
    "timepoint",
  ]

  return importFileWithCopy({
    filePath,
    tableName: "stop_times",
    columns,
    mapRow: (row) => {
      if (!row.trip_id || !row.stop_id || !row.stop_sequence) return null

      return [
        toNull(row.trip_id),
        toNull(row.arrival_time),
        toNull(row.departure_time),
        toNull(row.stop_id),
        toInt(row.stop_sequence),
        toNull(row.stop_headsign),
        toInt(row.pickup_type),
        toInt(row.drop_off_type),
        toInt(row.continuous_pickup),
        toInt(row.continuous_drop_off),
        toNumber(row.shape_dist_traveled),
        toInt(row.timepoint),
      ]
    },
  })
}

const importCalendar = async (dir) => {
  const filePath = path.join(dir, "calendar.txt")
  const columns = [
    "service_id",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "start_date",
    "end_date",
  ]

  return importFileWithCopy({
    filePath,
    tableName: "calendar",
    columns,
    mapRow: (row) => {
      if (!row.service_id) return null

      return [
        toNull(row.service_id),
        toInt(row.monday),
        toInt(row.tuesday),
        toInt(row.wednesday),
        toInt(row.thursday),
        toInt(row.friday),
        toInt(row.saturday),
        toInt(row.sunday),
        toGtfsDate(row.start_date),
        toGtfsDate(row.end_date),
      ]
    },
  })
}

const importCalendarDates = async (dir) => {
  const filePath = path.join(dir, "calendar_dates.txt")
  const columns = ["service_id", "date", "exception_type", "holiday_name"]

  return importFileWithCopy({
    filePath,
    tableName: "calendar_dates",
    columns,
    mapRow: (row) => {
      if (!row.service_id || !row.date || !row.exception_type) return null

      return [
        toNull(row.service_id),
        toGtfsDate(row.date),
        toInt(row.exception_type),
        toNull(row.holiday_name),
      ]
    },
  })
}

const importShapes = async (dir) => {
  const filePath = path.join(dir, "shapes.txt")
  const columns = [
    "shape_id",
    "shape_pt_lat",
    "shape_pt_lon",
    "shape_pt_sequence",
    "shape_dist_traveled",
  ]

  return importFileWithCopy({
    filePath,
    tableName: "shapes",
    columns,
    mapRow: (row) => {
      if (!row.shape_id || !row.shape_pt_sequence) return null

      return [
        toNull(row.shape_id),
        toNumber(row.shape_pt_lat),
        toNumber(row.shape_pt_lon),
        toInt(row.shape_pt_sequence),
        toNumber(row.shape_dist_traveled),
      ]
    },
  })
}

const importFeedInfo = async (dir) => {
  const filePath = path.join(dir, "feed_info.txt")
  const columns = [
    "feed_publisher_name",
    "feed_publisher_url",
    "feed_lang",
    "default_lang",
    "feed_start_date",
    "feed_end_date",
    "feed_version",
    "feed_contact_email",
    "feed_contact_url",
    "feed_id",
  ]

  return importFileWithCopy({
    filePath,
    tableName: "feed_info",
    columns,
    mapRow: (row) => {
      if (!row.feed_publisher_name || !row.feed_publisher_url || !row.feed_lang)
        return null

      const feedId = toNull(row.feed_id) || "transport-for-ireland"

      return [
        toNull(row.feed_publisher_name),
        toNull(row.feed_publisher_url),
        toNull(row.feed_lang),
        toNull(row.default_lang),
        toGtfsDate(row.feed_start_date),
        toGtfsDate(row.feed_end_date),
        toNull(row.feed_version),
        toNull(row.feed_contact_email),
        toNull(row.feed_contact_url),
        feedId,
      ]
    },
  })
}

export const importGTFSStaticData = async (options = {}) => {
  const gtfsDirectory = getGtfsDirectory(options.gtfsPath)
  const overallStartTime = Date.now()

  console.log(`Starting GTFS static import from: ${gtfsDirectory}`)

  if (!options.skipTablePreparation) {
    console.log("Preparing GTFS tables in PostgreSQL...")
    const tableStartTime = Date.now()
    await createGTFSTables()
    const tableEndTime = Date.now()
    console.log(
      `Table preparation completed in ${(
        (tableEndTime - tableStartTime) /
        1000
      ).toFixed(2)}s`,
    )
  }

  const results = {}
  const timings = {}

  let startTime = Date.now()
  results.agency = await importAgency(gtfsDirectory)
  timings.agency = Date.now() - startTime
  logFileResult("agency.txt", results.agency)
  console.log(`  Time: ${(timings.agency / 1000).toFixed(2)}s`)

  startTime = Date.now()
  results.stops = await importStops(gtfsDirectory)
  timings.stops = Date.now() - startTime
  logFileResult("stops.txt", results.stops)
  console.log(`  Time: ${(timings.stops / 1000).toFixed(2)}s`)

  startTime = Date.now()
  results.routes = await importRoutes(gtfsDirectory)
  timings.routes = Date.now() - startTime
  logFileResult("routes.txt", results.routes)
  console.log(`  Time: ${(timings.routes / 1000).toFixed(2)}s`)

  startTime = Date.now()
  results.trips = await importTrips(gtfsDirectory)
  timings.trips = Date.now() - startTime
  logFileResult("trips.txt", results.trips)
  console.log(`  Time: ${(timings.trips / 1000).toFixed(2)}s`)

  startTime = Date.now()
  results.stop_times = await importStopTimes(gtfsDirectory)
  timings.stop_times = Date.now() - startTime
  logFileResult("stop_times.txt", results.stop_times)
  console.log(`  Time: ${(timings.stop_times / 1000).toFixed(2)}s`)

  startTime = Date.now()
  results.calendar = await importCalendar(gtfsDirectory)
  timings.calendar = Date.now() - startTime
  logFileResult("calendar.txt", results.calendar)
  console.log(`  Time: ${(timings.calendar / 1000).toFixed(2)}s`)

  startTime = Date.now()
  results.calendar_dates = await importCalendarDates(gtfsDirectory)
  timings.calendar_dates = Date.now() - startTime
  logFileResult("calendar_dates.txt", results.calendar_dates)
  console.log(`  Time: ${(timings.calendar_dates / 1000).toFixed(2)}s`)

  startTime = Date.now()
  results.shapes = await importShapes(gtfsDirectory)
  timings.shapes = Date.now() - startTime
  logFileResult("shapes.txt", results.shapes)
  console.log(`  Time: ${(timings.shapes / 1000).toFixed(2)}s`)

  startTime = Date.now()
  results.feed_info = await importFeedInfo(gtfsDirectory)
  timings.feed_info = Date.now() - startTime
  logFileResult("feed_info.txt", results.feed_info)
  console.log(`  Time: ${(timings.feed_info / 1000).toFixed(2)}s`)

  const overallEndTime = Date.now()
  const totalTime = (overallEndTime - overallStartTime) / 1000

  console.log("\n" + "=".repeat(60))
  console.log("GTFS static import complete.")
  console.log(
    `Total import time: ${totalTime.toFixed(2)}s (${(totalTime / 60).toFixed(
      2,
    )} minutes)`,
  )
  console.log("=".repeat(60) + "\n")

  console.table(
    Object.entries(results).map(([key, value]) => ({
      file: `${key}.txt`,
      inserted: value.inserted,
      skipped: value.skipped,
      errors: value.errors,
      time_seconds: (timings[key] / 1000).toFixed(2),
    })),
  )

  return results
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  importGTFSStaticData().catch((error) => {
    console.error("GTFS import failed:", error)
    process.exitCode = 1
  })
}
