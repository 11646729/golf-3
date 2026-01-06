#!/usr/bin/env node

import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import { importAgencyTxt } from "./readGtfsFiles.js"

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// -------------------------------------------------------
// Parse command-line arguments
// -------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2)
  let filePath = null

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file" && i + 1 < args.length) {
      filePath = args[i + 1]
      i++
    } else if (args[i] === "--help" || args[i] === "-h") {
      console.log(`
Usage: node gtfs_import_agency.js --file <path-to-agency.txt>

Options:
  --file <path>  Path to the agency.txt file to import
  --help, -h     Show this help message

Example:
  node gtfs_import_agency.js --file backend/gtfs_data/TransportForIreland/agency.txt
      `)
      process.exit(0)
    }
  }

  return filePath
}

// -------------------------------------------------------
// Main execution
// -------------------------------------------------------
async function main() {
  try {
    let filePath = parseArgs()

    // Default to TransportForIreland agency.txt if no file specified
    if (!filePath) {
      filePath = path.join(
        __dirname,
        "gtfs_data",
        "TransportForIreland",
        "agency.txt"
      )
      console.log(`No file specified, using default: ${filePath}`)
    }

    // Convert to absolute path if relative
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(process.cwd(), filePath)
    }

    console.log(`Starting agency import from: ${filePath}\n`)

    const stats = await importAgencyTxt(filePath)

    console.log("Import completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Fatal error during import:", error)
    process.exit(1)
  }
}

main()
