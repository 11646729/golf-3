#!/usr/bin/env node

import dotenv from "dotenv"
import { DatabaseAdapter } from "./databaseUtilities.js"

// Load environment variables
dotenv.config()

const db = new DatabaseAdapter()

async function setupAgencyTable() {
  try {
    console.log("Setting up agency table in golf3db...\n")

    // Create the agency table
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS agency (
        agency_id TEXT PRIMARY KEY,
        agency_name TEXT NOT NULL,
        agency_url TEXT NOT NULL,
        agency_timezone TEXT NOT NULL,
        agency_lang TEXT,
        agency_phone TEXT,
        agency_fare_url TEXT,
        agency_email TEXT,
        cemv_support INTEGER CHECK(cemv_support >= 0 AND cemv_support <= 2)
      )
    `

    await db.run(createTableSql)
    console.log("✓ Agency table created successfully\n")

    // Get a count of existing records
    const result = await db.get("SELECT COUNT(*) as count FROM agency")
    console.log(`Current records in agency table: ${result.count}`)

    process.exit(0)
  } catch (error) {
    console.error("✗ Error setting up agency table:", error.message)
    process.exit(1)
  }
}

setupAgencyTable()
