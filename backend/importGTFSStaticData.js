import fs from "fs"
import path from "path"
import { parse } from "csv-parse"
import dotenv from "dotenv"
import { DatabaseAdapter } from "./databaseUtilities.js"
import { createGTFSTables } from "./createGTFSTables/createGTFSTables.js"
import readRouteFile from "./readGtfsFiles.js"

// Load environment variables when running as standalone script
if (process.argv[1] === new URL(import.meta.url).pathname) {
  dotenv.config()
}

const db = new DatabaseAdapter()

const defaultConfigPath = new URL(
  "./gtfs_config_files/configTransportForIrelandPostgres.json",
  import.meta.url
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
    `Finished ${fileName}: ${stats.inserted} rows added, ${stats.skipped} skipped, ${stats.errors} errors.`
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
  const insertSql = `
		INSERT INTO agency (
			agency_id, agency_name, agency_url, agency_timezone, agency_lang,
			agency_phone, agency_fare_url, agency_email, cemv_support
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (agency_id) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql,
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
  const insertSql = `
		INSERT INTO stops (
			stop_id, stop_code, stop_name, tts_stop_name, stop_desc, stop_lat, stop_lon,
			zone_id, stop_url, location_type, parent_station, stop_timezone,
			wheelchair_boarding, level_id, platform_code, stop_access
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (stop_id) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql,
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
  const insertSql = `
		INSERT INTO routes (
			route_id, agency_id, route_short_name, route_long_name, route_desc,
			route_type, route_url, route_color, route_text_color, route_sort_order,
			continuous_pickup, continuous_drop_off, network_id
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (route_id) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql,
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

  // Build SQL dynamically based on available columns
  // Most GTFS feeds include: route_id, service_id, trip_id, trip_headsign, trip_short_name, direction_id, block_id, shape_id
  // Optional columns: wheelchair_accessible, bikes_allowed
  const baseSql = `
		INSERT INTO trips (
			trip_id, route_id, service_id, trip_headsign, trip_short_name,
			direction_id, block_id, shape_id
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (trip_id) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql: baseSql,
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
  const insertSql = `
		INSERT INTO stop_times (
			trip_id, arrival_time, departure_time, stop_id, stop_sequence,
			stop_headsign, pickup_type, drop_off_type, continuous_pickup,
			continuous_drop_off, shape_dist_traveled, timepoint
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (trip_id, stop_sequence) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql,
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
  const insertSql = `
		INSERT INTO calendar (
			service_id, monday, tuesday, wednesday, thursday, friday, saturday,
			sunday, start_date, end_date
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (service_id) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql,
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
  const insertSql = `
		INSERT INTO calendar_dates (
			service_id, date, exception_type, holiday_name
		) VALUES (?, ?, ?, ?)
		ON CONFLICT (service_id, date) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql,
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
  const insertSql = `
		INSERT INTO shapes (
			shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence, shape_dist_traveled
		) VALUES (?, ?, ?, ?, ?)
		ON CONFLICT (shape_id, shape_pt_sequence) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql,
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
  const insertSql = `
		INSERT INTO feed_info (
			feed_publisher_name, feed_publisher_url, feed_lang, default_lang,
			feed_start_date, feed_end_date, feed_version, feed_contact_email,
			feed_contact_url, feed_id
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (feed_id) DO NOTHING
	`

  return importFile({
    filePath,
    insertSql,
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

  console.log(`Starting GTFS static import from: ${gtfsDirectory}`)

  if (!options.skipTablePreparation) {
    console.log("Preparing GTFS tables in PostgreSQL...")
    await createGTFSTables()
  }

  const results = {}

  results.agency = await importAgency(gtfsDirectory)
  logFileResult("agency.txt", results.agency)

  results.stops = await importStops(gtfsDirectory)
  logFileResult("stops.txt", results.stops)

  results.routes = await importRoutes(gtfsDirectory)
  logFileResult("routes.txt", results.routes)

  results.trips = await importTrips(gtfsDirectory)
  logFileResult("trips.txt", results.trips)

  results.stop_times = await importStopTimes(gtfsDirectory)
  logFileResult("stop_times.txt", results.stop_times)

  results.calendar = await importCalendar(gtfsDirectory)
  logFileResult("calendar.txt", results.calendar)

  results.calendar_dates = await importCalendarDates(gtfsDirectory)
  logFileResult("calendar_dates.txt", results.calendar_dates)

  results.shapes = await importShapes(gtfsDirectory)
  logFileResult("shapes.txt", results.shapes)

  results.feed_info = await importFeedInfo(gtfsDirectory)
  logFileResult("feed_info.txt", results.feed_info)

  console.log("GTFS static import complete.")
  console.table(
    Object.entries(results).map(([key, value]) => ({
      file: `${key}.txt`,
      inserted: value.inserted,
      skipped: value.skipped,
      errors: value.errors,
    }))
  )

  return results
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  importGTFSStaticData().catch((error) => {
    console.error("GTFS import failed:", error)
    process.exitCode = 1
  })
}
