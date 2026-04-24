import pg from "pg"

// Singleton PostgreSQL client
let client = null
let connecting = null

// -------------------------------------------------------
// Database Adapter Class - PostgreSQL
// -------------------------------------------------------
class DatabaseAdapter {
  constructor(pgClient) {
    this.client = pgClient
  }

  // Convert ? placeholders to $1, $2, etc for PostgreSQL
  _convertQuery(sql, params) {
    let i = 1
    return { sql: sql.replace(/\?/g, () => `$${i++}`), params }
  }

  // Execute SQL statement (INSERT, UPDATE, DELETE)
  async run(sql, params = []) {
    const { sql: q, params: p } = this._convertQuery(sql, params)
    const result = await this.client.query(q, p)
    return { lastID: result.rows[0]?.id || null, changes: result.rowCount || 0 }
  }

  // Fetch all rows
  async all(sql, params = []) {
    const { sql: q, params: p } = this._convertQuery(sql, params)
    const result = await this.client.query(q, p)
    return result.rows
  }

  // Fetch single row
  async get(sql, params = []) {
    const { sql: q, params: p } = this._convertQuery(sql, params)
    const result = await this.client.query(q, p)
    return result.rows[0] || null
  }
}

// -------------------------------------------------------
// Get or create database connection (with retry)
// -------------------------------------------------------
async function getConnection() {
  if (client) return client
  if (connecting) {
    await connecting
    return client
  }

  const url = process.env.DATABASE_URL
  if (!url?.startsWith("postgres")) {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL")
  }

  connecting = (async () => {
    const maxAttempts = 5
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const pgClient = new pg.Client(url)
        await pgClient.connect()
        client = pgClient
        console.log("Connected to PostgreSQL database...")
        return
      } catch (err) {
        console.error(`DB connection attempt ${attempt}/${maxAttempts} failed:`, err.message)
        if (attempt === maxAttempts) throw err
        await new Promise((r) => setTimeout(r, 2000 * attempt))
      }
    }
  })()

  try {
    await connecting
  } finally {
    connecting = null
  }
  return client
}

// -------------------------------------------------------
// Lazy adapter that connects on first use
// -------------------------------------------------------
class LazyDatabaseAdapter {
  constructor() {
    this._adapter = null
  }

  async _getAdapter() {
    if (!this._adapter) {
      this._adapter = new DatabaseAdapter(await getConnection())
    }
    return this._adapter
  }

  async run(sql, params = []) {
    return (await this._getAdapter()).run(sql, params)
  }

  async all(sql, params = []) {
    return (await this._getAdapter()).all(sql, params)
  }

  async get(sql, params = []) {
    return (await this._getAdapter()).get(sql, params)
  }
}

// -------------------------------------------------------
// Backward compatibility exports
// -------------------------------------------------------
export const openSqlDbConnection = async () => {
  return new LazyDatabaseAdapter()
}

export const closeSqlDbConnection = (_adapter) => {
  // No-op: using singleton connection that lives for app lifetime
}

// Export LazyDatabaseAdapter as DatabaseAdapter for backward compatibility
export { LazyDatabaseAdapter as DatabaseAdapter }
export const createDatabaseAdapter = async () =>
  new DatabaseAdapter(await getConnection())

// Run fn inside a single BEGIN/COMMIT/ROLLBACK block on the shared connection.
// All operations that go through getConnection() (DatabaseAdapter, createDatabaseAdapter)
// share the same pg.Client, so they are automatically included in this transaction.
export const withTransaction = async (fn) => {
  const pgClient = await getConnection()
  await pgClient.query("BEGIN")
  try {
    const result = await fn()
    await pgClient.query("COMMIT")
    return result
  } catch (err) {
    try {
      await pgClient.query("ROLLBACK")
    } catch (rollbackErr) {
      console.error("ROLLBACK failed:", rollbackErr.message)
    }
    throw err
  }
}
