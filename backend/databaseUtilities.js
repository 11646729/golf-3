import pg from "pg"
import sqlite3 from "sqlite3"

sqlite3.verbose()

// Module-level singleton connections
let pooledPgClient = null
let pooledSqliteDb = null

// -------------------------------------------------------
// Database Adapter Class - works with both PostgreSQL and SQLite
// -------------------------------------------------------
class DatabaseAdapter {
  constructor(client, type) {
    this.client = client
    this.type = type // 'postgres' or 'sqlite'
    this._connectionPromise = null

    // If no client provided, auto-connect to database
    if (!client) {
      this._connectionPromise = this._autoConnect()
    }
  }

  // Auto-connect to database using environment variables
  async _autoConnect() {
    const url = process.env.DATABASE_URL || process.env.SQL_URI
    if (!url) {
      throw new Error("No database URL found in environment variables")
    }

    const adapter = await openSqlDbConnection(url)
    this.client = adapter.client
    this.type = adapter.type
    return this
  }

  // Ensure connection is established
  async _ensureConnection() {
    if (this._connectionPromise) {
      await this._connectionPromise
      this._connectionPromise = null // Clear after first use
    }
  }

  // Convert ? placeholders to $1, $2, etc for PostgreSQL
  convertQuery(sql, params) {
    if (this.type === "postgres") {
      let index = 1
      const convertedSql = sql.replace(/\?/g, () => `$${index++}`)
      return { sql: convertedSql, params }
    }
    return { sql, params }
  }

  // SQLite-compatible .run() method - supports both callbacks and promises
  async run(sql, params = [], callback) {
    await this._ensureConnection()

    const { sql: convertedSql, params: convertedParams } = this.convertQuery(
      sql,
      params
    )

    // If no callback provided, return a Promise
    if (!callback) {
      return new Promise((resolve, reject) => {
        if (this.type === "postgres") {
          this.client
            .query(convertedSql, convertedParams)
            .then((result) => {
              const mockThis = {
                lastID: result.insertId || null,
                changes: result.rowCount || 0,
              }
              resolve(mockThis)
            })
            .catch(reject)
        } else {
          this.client.run(convertedSql, convertedParams, function (err) {
            if (err) reject(err)
            else resolve({ lastID: this.lastID, changes: this.changes })
          })
        }
      })
    }

    // Callback-based usage
    if (this.type === "postgres") {
      this.client
        .query(convertedSql, convertedParams)
        .then((result) => {
          const mockThis = {
            lastID: result.insertId || null,
            changes: result.rowCount || 0,
          }
          callback.call(mockThis, null)
        })
        .catch((err) => callback(err))
    } else {
      this.client.run(convertedSql, convertedParams, callback)
    }
  }

  // SQLite-compatible .all() method - supports both callbacks and promises
  async all(sql, params = [], callback) {
    await this._ensureConnection()

    const { sql: convertedSql, params: convertedParams } = this.convertQuery(
      sql,
      params
    )

    // If no callback provided, return a Promise
    if (!callback) {
      return new Promise((resolve, reject) => {
        if (this.type === "postgres") {
          this.client
            .query(convertedSql, convertedParams)
            .then((result) => resolve(result.rows))
            .catch(reject)
        } else {
          this.client.all(convertedSql, convertedParams, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
          })
        }
      })
    }

    // Callback-based usage
    if (this.type === "postgres") {
      this.client
        .query(convertedSql, convertedParams)
        .then((result) => callback(null, result.rows))
        .catch((err) => callback(err, null))
    } else {
      this.client.all(convertedSql, convertedParams, callback)
    }
  }

  // SQLite-compatible .get() method - supports both callbacks and promises
  async get(sql, params = [], callback) {
    await this._ensureConnection()

    const { sql: convertedSql, params: convertedParams } = this.convertQuery(
      sql,
      params
    )

    // If no callback provided, return a Promise
    if (!callback) {
      return new Promise((resolve, reject) => {
        if (this.type === "postgres") {
          this.client
            .query(convertedSql, convertedParams)
            .then((result) => resolve(result.rows[0] || null))
            .catch(reject)
        } else {
          this.client.get(convertedSql, convertedParams, (err, row) => {
            if (err) reject(err)
            else resolve(row)
          })
        }
      })
    }

    // Callback-based usage
    if (this.type === "postgres") {
      this.client
        .query(convertedSql, convertedParams)
        .then((result) => callback(null, result.rows[0] || null))
        .catch((err) => callback(err, null))
    } else {
      this.client.get(convertedSql, convertedParams, callback)
    }
  }

  // Close connection
  close() {
    if (this.type === "postgres") {
      return this.client.end()
    } else {
      return this.client.close()
    }
  }
}

// -------------------------------------------------------
// Function to detect database type from URL
// -------------------------------------------------------
function detectDatabaseType(url) {
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return "postgres"
  }
  return "sqlite"
}

// -------------------------------------------------------
// Function to open database connection (supports both PostgreSQL and SQLite)
// -------------------------------------------------------
export var openSqlDbConnection = async (url) => {
  // Guard clause for null Database Url
  if (!url) {
    console.log("Invalid Database url")
    return null
  }

  const dbType = detectDatabaseType(url)

  try {
    if (dbType === "postgres") {
      // If we already have a pooled PostgreSQL connection return it
      if (pooledPgClient) return new DatabaseAdapter(pooledPgClient, "postgres")

      // Create PostgreSQL client
      const client = new pg.Client(url)
      await client.connect()

      pooledPgClient = client
      console.log("Connected to PostgreSQL database - Here")

      return new DatabaseAdapter(pooledPgClient, "postgres")
    } else {
      // SQLite connection (existing logic)
      if (pooledSqliteDb) return new DatabaseAdapter(pooledSqliteDb, "sqlite")

      const db = new sqlite3.Database(url, (err) => {
        if (err) {
          console.error("Failed to open SQLite database:", err.message)
        }
      })

      // Configure to reduce busy/lock errors
      try {
        if (typeof db.configure === "function") {
          db.configure("busyTimeout", 5000)
        }
      } catch (e) {
        // ignore if not supported
      }

      // Use WAL journal mode
      db.run("PRAGMA journal_mode = WAL;", [], (err) => {
        if (err) console.warn("Could not set WAL journal mode:", err.message)
      })

      db.run("PRAGMA synchronous = NORMAL;", [], (err) => {
        if (err) console.warn("Could not set synchronous PRAGMA:", err.message)
      })

      pooledSqliteDb = db
      console.log("Connected to SQLite database")
      return new DatabaseAdapter(pooledSqliteDb, "sqlite")
    }
  } catch (err) {
    console.error(
      `UNSUCCESSFUL in connecting to the ${dbType} database`,
      err?.message || err
    )
    return null
  }
}

// -------------------------------------------------------
// Function to close database connection
// -------------------------------------------------------
export var closeSqlDbConnection = (adapter) => {
  // Guard clause for null Database Connection
  if (!adapter) {
    return
  }

  // Don't close pooled connections (reuse across app lifetime)
  if (
    adapter.type === "postgres" &&
    pooledPgClient &&
    adapter.client === pooledPgClient
  ) {
    return // No-op: pooled connection is intended to live for the app lifetime
  }

  if (
    adapter.type === "sqlite" &&
    pooledSqliteDb &&
    adapter.client === pooledSqliteDb
  ) {
    return // No-op: pooled connection is intended to live for the app lifetime
  }

  try {
    adapter.close()
  } catch (e) {
    console.warn("Error closing database connection:", e?.message || e)
  }
}

// Export the DatabaseAdapter class for controllers to use
export { DatabaseAdapter }

// Factory function to create a DatabaseAdapter connected to PostgreSQL
export const createDatabaseAdapter = async () => {
  const url = process.env.DATABASE_URL || process.env.SQL_URI
  const adapter = await openSqlDbConnection(url)
  return adapter
}
