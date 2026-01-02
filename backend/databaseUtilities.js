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
// Get or create database connection
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
    client = new pg.Client(url)
    await client.connect()
    console.log("Connected to PostgreSQL database...")
    connecting = null
  })()

  await connecting
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

export const closeSqlDbConnection = (adapter) => {
  // No-op: using singleton connection that lives for app lifetime
}

// Export LazyDatabaseAdapter as DatabaseAdapter for backward compatibility
export { LazyDatabaseAdapter as DatabaseAdapter }
export const createDatabaseAdapter = async () =>
  new DatabaseAdapter(await getConnection())
