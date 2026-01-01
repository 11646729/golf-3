import sqlite3 from "sqlite3"
import path from "path"

sqlite3.verbose()

// Idempotent migration to add missing vessel columns to `vessels` table
const desiredColumns = [
  { name: "vesseltitle", type: "TEXT", notnull: true, default: "''" },
  { name: "vesselflag", type: "TEXT", notnull: true, default: "'Not Known'" },
  // add any other future columns here if needed
]

const run = async () => {
  const dbPath =
    process.env.SQL_URI || path.join("backend", "sqlite3_data", "general.db")
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Could not open database at", dbPath, err.message)
      process.exit(1)
    }
  })

  try {
    db.serialize(() => {
      db.all("PRAGMA table_info('vessels')", [], (err, rows) => {
        if (err) {
          console.error("Error reading table info:", err.message)
          process.exit(1)
        }

        const existing = new Set(rows.map((r) => r.name))

        // If table doesn't exist at all, create with full schema from vesselController
        if (rows.length === 0) {
          console.log("vessels table not found — creating full table")
          const createSql = `CREATE TABLE IF NOT EXISTS vessels (vesselid INTEGER PRIMARY KEY AUTOINCREMENT, databaseversion INTEGER, vesselnameurl TEXT NOT NULL, vesselname TEXT NOT NULL, vesseltitle TEXT NOT NULL, vesselurl TEXT NOT NULL, vesseltype TEXT NOT NULL, vesselflag TEXT NOT NULL, vesselshortoperator TEXT NOT NULL, vessellongoperator TEXT NOT NULL, vesselyearbuilt TEXT NOT NULL, vessellengthmetres INTEGER, vesselwidthmetres INTEGER, vesselgrosstonnage INTEGER, vesselaveragespeedknots REAL, vesselmaxspeedknots REAL, vesselaveragedraughtmetres REAL, vesselimonumber INTEGER, vesselmmsnumber INTEGER, vesselcallsign TEXT NOT NULL, vesseltypicalpassengers TEXT, vesseltypicalcrew INTEGER, currentpositionlng REAL CHECK( currentpositionlng >= -180 AND currentpositionlng <= 180 ), currentpositionlat REAL CHECK( currentpositionlat >= -90 AND currentpositionlat <= 90 ), currentpositiontime TEXT)`

          db.run(createSql, [], (cErr) => {
            if (cErr) {
              console.error("Error creating vessels table:", cErr.message)
              process.exit(1)
            }
            console.log("Created vessels table with expected schema")
            db.close()
            process.exit(0)
          })
          return
        }

        // Add any missing columns via ALTER TABLE (idempotent)
        const missing = desiredColumns.filter((c) => !existing.has(c.name))

        if (missing.length === 0) {
          console.log("No missing vessel columns detected")
          db.close()
          process.exit(0)
        }

        console.log(
          "Adding missing columns:",
          missing.map((m) => m.name).join(", ")
        )

        const addNext = (i) => {
          if (i >= missing.length) {
            console.log("Migration complete")
            db.close()
            process.exit(0)
          }

          const col = missing[i]
          const notnull = col.notnull ? "NOT NULL" : ""
          const sql = `ALTER TABLE vessels ADD COLUMN ${col.name} ${col.type} ${notnull} DEFAULT ${col.default}`

          db.run(sql, [], (aErr) => {
            if (aErr) {
              // If column already exists concurrently, ignore
              if (
                aErr.message &&
                aErr.message.includes("duplicate column name")
              ) {
                console.warn("Column already exists, skipping:", col.name)
                addNext(i + 1)
                return
              }
              console.error("Error adding column", col.name, aErr.message)
              process.exit(1)
            }
            console.log("Added column", col.name)
            addNext(i + 1)
          })
        }

        addNext(0)
      })
    })
  } catch (err) {
    console.error("Migration failed:", err?.message || err)
    db.close()
    process.exit(1)
  }
}

run()
