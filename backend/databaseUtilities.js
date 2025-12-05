import pg from "pg"

// Module-level singleton connections
let pooledPgClient = null
let connectionInProgress = null // Track if connection is in progress

// -------------------------------------------------------
// Database Adapter Class - PostgreSQL
// -------------------------------------------------------
class DatabaseAdapter {
  constructor(client) {
    this.client = client
    this._connectionPromise = null
    this._connectionError = null

    // If no client provided, auto-connect to database
    if (!client) {
      this._connectionPromise = this._autoConnect().catch((err) => {
        this._connectionError = err
        return null
      })
    }
  }

  // Auto-connect to database using environment variables
  async _autoConnect() {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error("No database URL found in environment variables")
    }

    const adapter = await openSqlDbConnection(url)

    if (!adapter) {
      throw new Error("Failed to establish database connection")
    }
    this.client = adapter.client
    return this
  }

  // Ensure connection is established
  async _ensureConnection() {
    if (this._connectionPromise) {
      await this._connectionPromise
      this._connectionPromise = null // Clear after first use
    }

    if (this._connectionError) {
      throw this._connectionError
    }
  }

  // Convert ? placeholders to $1, $2, etc for PostgreSQL
  convertQuery(sql, params) {
    let index = 1
    const convertedSql = sql.replace(/\?/g, () => `$${index++}`)
    return { sql: convertedSql, params }
  }

  // Execute SQL statement (INSERT, UPDATE, DELETE)
  async run(sql, params = []) {
    await this._ensureConnection()

    const { sql: convertedSql, params: convertedParams } = this.convertQuery(
      sql,
      params
    )

    const result = await this.client.query(convertedSql, convertedParams)
    return {
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount || 0,
    }
  }

  // Fetch all rows
  async all(sql, params = []) {
    await this._ensureConnection()

    const { sql: convertedSql, params: convertedParams } = this.convertQuery(
      sql,
      params
    )

    const result = await this.client.query(convertedSql, convertedParams)
    return result.rows
  }

  // Fetch single row
  async get(sql, params = []) {
    await this._ensureConnection()

    const { sql: convertedSql, params: convertedParams } = this.convertQuery(
      sql,
      params
    )

    const result = await this.client.query(convertedSql, convertedParams)
    return result.rows[0] || null
  }

  // Close connection
  close() {
    return this.client.end()
  }
}

// -------------------------------------------------------
// Function to open PostgreSQL database connection
// -------------------------------------------------------
export var openSqlDbConnection = async (url) => {
  // Guard clause for null Database Url
  if (!url) {
    console.log("Invalid Database url")
    return null
  }

  // Validate PostgreSQL URL
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    console.error(
      "Invalid PostgreSQL URL - must start with postgres:// or postgresql://"
    )
    return null
  }

  // If a connection is already in progress, wait for it
  if (connectionInProgress) {
    await connectionInProgress
  }

  try {
    // If we already have a pooled PostgreSQL connection return it
    if (pooledPgClient) return new DatabaseAdapter(pooledPgClient)

    console.log("Connecting to PostgreSQL database...")

    // Set connection in progress to prevent race conditions
    connectionInProgress = (async () => {
      // Double-check after awaiting in case another connection was established
      if (pooledPgClient) return

      // Create PostgreSQL client
      const client = new pg.Client(url)
      await client.connect()

      pooledPgClient = client
      console.log("Connected to PostgreSQL database")
      connectionInProgress = null // Clear the flag
    })()

    await connectionInProgress

    return new DatabaseAdapter(pooledPgClient)
  } catch (err) {
    console.error(
      "UNSUCCESSFUL in connecting to the PostgreSQL database",
      err?.message || err
    )
    connectionInProgress = null
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
  if (pooledPgClient && adapter.client === pooledPgClient) {
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
  // const url = process.env.DATABASE_URL
  //  || process.env.SQL_URI
  // const adapter = await openSqlDbConnection(url)
  return await openSqlDbConnection(process.env.DATABASE_URL)
}
