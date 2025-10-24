import pg from "pg"

// Module-level singleton connection pool to avoid repeated connections
let pooledClient = null

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
