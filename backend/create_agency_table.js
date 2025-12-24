#!/usr/bin/env node

import dotenv from "dotenv"
import { DatabaseAdapter } from "./databaseUtilities.js"

// Load environment variables
dotenv.config()

const db = new DatabaseAdapter()

async function createAgencyTable() {
  try {
    console.log("Creating agency table...")

    // Check if agency table exists using PostgreSQL system tables
    const tableExists = await db.get(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'agency'
      )`
    )

    if (tableExists.exists) {
      console.log("Agency table already exists")
      return
    }

    // GTFS Agency table
    await db.run(`
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
    `)

    console.log("✓ Agency table created successfully")
  } catch (error) {
    console.error("Error creating agency table:", error)
    process.exit(1)
  }
}

async function main() {
  await createAgencyTable()
  console.log("Done!")
  process.exit(0)
}

main()
