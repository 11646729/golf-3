#!/usr/bin/env node
import sqlite3 from "sqlite3"
import pg from "pg"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Database configuration
const SQLITE_DB_PATH =
  "/Users/briansmith/Documents/GTD/golf-3/backend/sqlite3_data/general.db"
const POSTGRES_URL = "postgres://guser:IesBds6052@localhost:5432/golf3db"

// PostgreSQL connection
const pgClient = new pg.Client(POSTGRES_URL)

// SQLite connection
const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH)

// PostgreSQL table schemas based on SQLite
const postgresSchemas = {
  temperatures: `
    CREATE TABLE IF NOT EXISTS temperatures (
      temperatureid SERIAL PRIMARY KEY,
      timenow TEXT NOT NULL,
      databaseversion INTEGER,
      timeofmeasurement TEXT NOT NULL,
      locationname TEXT NOT NULL,
      locationtemperature REAL,
      lng REAL CHECK (lng >= -180 AND lng <= 180),
      lat REAL CHECK (lat >= -90 AND lat <= 90)
    );
  `,

  seismicdesigns: `
    CREATE TABLE IF NOT EXISTS seismicdesigns (
      seismicdesignsid SERIAL PRIMARY KEY,
      name TEXT
    );
  `,

  rtcalendar: `
    CREATE TABLE IF NOT EXISTS rtcalendar (
      eventid SERIAL PRIMARY KEY,
      dtstamp TEXT NOT NULL,
      event_description TEXT NOT NULL
    );
  `,

  rtnews: `
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
      _score REAL,
      _id TEXT
    );
  `,

  golfcourses: `
    CREATE TABLE IF NOT EXISTS golfcourses (
      courseid SERIAL PRIMARY KEY,
      databaseversion INTEGER,
      type TEXT NOT NULL,
      crsurn TEXT NOT NULL,
      name TEXT NOT NULL,
      phonenumber TEXT NOT NULL,
      phototitle TEXT NOT NULL,
      photourl TEXT NOT NULL,
      description TEXT,
      lng REAL CHECK (lng >= -180 AND lng <= 180),
      lat REAL CHECK (lat >= -90 AND lat <= 90)
    );
  `,

  portarrivals: `
    CREATE TABLE IF NOT EXISTS portarrivals (
      portarrivalid SERIAL PRIMARY KEY,
      databaseversion INTEGER,
      sentencecaseport TEXT NOT NULL,
      portname TEXT NOT NULL,
      portunlocode TEXT NOT NULL,
      portcoordinatelng REAL CHECK (portcoordinatelng >= -180 AND portcoordinatelng <= 180),
      portcoordinatelat REAL CHECK (portcoordinatelat >= -90 AND portcoordinatelat <= 90),
      cruiseline TEXT,
      cruiselinelogo TEXT,
      vesselshortcruisename TEXT,
      arrivaldate TEXT,
      weekday TEXT,
      vesseleta TEXT,
      vesseletatime TEXT,
      vesseletd TEXT,
      vesseletdtime TEXT,
      vesselnameurl TEXT
    );
  `,

  vessels: `
    CREATE TABLE IF NOT EXISTS vessels (
      vesselid SERIAL PRIMARY KEY,
      databaseversion INTEGER,
      vesselnameurl TEXT NOT NULL,
      vesselname TEXT NOT NULL,
      vesseltitle TEXT NOT NULL,
      vesselurl TEXT NOT NULL,
      vesseltype TEXT NOT NULL,
      vesselflag TEXT NOT NULL,
      vesselshortoperator TEXT NOT NULL,
      vessellongoperator TEXT NOT NULL,
      vesselyearbuilt TEXT NOT NULL,
      vessellengthmetres INTEGER,
      vesselwidthmetres INTEGER,
      vesselgrosstonnage INTEGER,
      vesselaveragespeedknots REAL,
      vesselmaxspeedknots REAL,
      vesselaveragedraughtmetres REAL,
      vesselimonumber INTEGER,
      vesselmmsnumber INTEGER,
      vesselcallsign TEXT NOT NULL,
      vesseltypicalpassengers TEXT,
      vesseltypicalcrew INTEGER,
      currentpositionlng REAL CHECK (currentpositionlng >= -180 AND currentpositionlng <= 180),
      currentpositionlat REAL CHECK (currentpositionlat >= -90 AND currentpositionlat <= 90),
      currentpositiontime TEXT
    );
  `,
}

async function createPostgresTables() {
  console.log("Creating PostgreSQL tables...")

  for (const [tableName, schema] of Object.entries(postgresSchemas)) {
    try {
      await pgClient.query(schema)
      console.log(`✓ Created table: ${tableName}`)
    } catch (error) {
      console.error(`✗ Error creating table ${tableName}:`, error.message)
      throw error
    }
  }
}

async function migrateTableData(tableName) {
  return new Promise((resolve, reject) => {
    console.log(`Migrating data for table: ${tableName}`)

    // Get all data from SQLite
    sqliteDb.all(`SELECT * FROM ${tableName}`, [], async (err, rows) => {
      if (err) {
        console.error(
          `✗ Error reading from SQLite table ${tableName}:`,
          err.message
        )
        reject(err)
        return
      }

      if (rows.length === 0) {
        console.log(`  → Table ${tableName} is empty, skipping...`)
        resolve()
        return
      }

      try {
        // Get column names (excluding auto-increment IDs)
        const firstRow = rows[0]
        const columns = Object.keys(firstRow)

        // For each row, insert into PostgreSQL
        for (const row of rows) {
          // Clean data for specific tables
          const cleanedRow = { ...row }

          if (tableName === "vessels") {
            // Convert "Not Known" to null for numeric fields
            const numericFields = [
              "vesselaveragespeedknots",
              "vesselmaxspeedknots",
              "vesselaveragedraughtmetres",
              "vessellengthmetres",
              "vesselwidthmetres",
              "vesselgrosstonnage",
              "vesselimonumber",
              "vesselmmsnumber",
              "vesseltypicalcrew",
              "currentpositionlng",
              "currentpositionlat",
            ]

            numericFields.forEach((field) => {
              if (
                cleanedRow[field] === "Not Known" ||
                cleanedRow[field] === "" ||
                cleanedRow[field] === "NULL"
              ) {
                cleanedRow[field] = null
              }
            })
          }

          const values = columns.map((col) => cleanedRow[col])
          const placeholders = values.map((_, i) => `$${i + 1}`).join(", ")
          const columnNames = columns.join(", ")

          const insertQuery = `
            INSERT INTO ${tableName} (${columnNames}) 
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `

          await pgClient.query(insertQuery, values)
        }

        console.log(`  ✓ Migrated ${rows.length} rows to ${tableName}`)
        resolve()
      } catch (error) {
        console.error(
          `✗ Error inserting data into ${tableName}:`,
          error.message
        )
        reject(error)
      }
    })
  })
}

async function runMigration() {
  try {
    console.log("Starting SQLite to PostgreSQL migration...")
    console.log("==========================================")

    // Connect to PostgreSQL
    await pgClient.connect()
    console.log("✓ Connected to PostgreSQL")

    // Create tables
    await createPostgresTables()

    // Get list of tables from SQLite
    const tables = [
      "temperatures",
      "seismicdesigns",
      "rtcalendar",
      "rtnews",
      "golfcourses",
      "portarrivals",
      "vessels",
    ]

    // Migrate data for each table
    for (const table of tables) {
      await migrateTableData(table)
    }

    console.log("==========================================")
    console.log("✓ Migration completed successfully!")
    console.log("  → All data has been migrated from SQLite to PostgreSQL")
    console.log("  → You can now update your application to use PostgreSQL")
  } catch (error) {
    console.error("✗ Migration failed:", error.message)
    process.exit(1)
  } finally {
    // Close connections
    sqliteDb.close()
    await pgClient.end()
    console.log("✓ Database connections closed")
  }
}

// Run the migration if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
}

export { runMigration }
