import { DatabaseAdapter } from "../databaseUtilities.js"
import { createAgencyTable } from "./createAgencyTable.js"
import { createStopsTable } from "./createStopsTable.js"
import { createRoutesTable } from "./createRoutesTable.js"
import { createTripsTable } from "./createTripsTable.js"
import { createStopTimesTable } from "./createStopTimesTable.js"
import { createCalendarTable } from "./createCalendarTable.js"
import { createCalendarDatesTable } from "./createCalendarDatesTable.js"
import { createFareAttributesTable } from "./createFareAttributesTable.js"
import { createFareRulesTable } from "./createFareRulesTable.js"
import { createTimeframesTable } from "./createTimeframesTable.js"
import { createRiderCategoriesTable } from "./createRiderCategoriesTable.js"
import { createFareMediaTable } from "./createFareMediaTable.js"
import { createFareProductsTable } from "./createFareProductsTable.js"
import { createFareLegRulesTable } from "./createFareLegRulesTable.js"
import { createFareLegJoinRulesTable } from "./createFareLegJoinRulesTable.js"
import { createFareTransferRulesTable } from "./createFareTransferRulesTable.js"
import { createAreasTable } from "./createAreasTable.js"
import { createStopAreasTable } from "./createStopAreasTable.js"
import { createNetworksTable } from "./createNetworksTable.js"
import { createRouteNetworksTable } from "./createRouteNetworksTable.js"
import { createShapesTable } from "./createShapesTable.js"
import { createFrequenciesTable } from "./createFrequenciesTable.js"
import { createTransfersTable } from "./createTransfersTable.js"
import { createPathwaysTable } from "./createPathwaysTable.js"
import { createLevelsTable } from "./createLevelsTable.js"
import { createLocationGroupsTable } from "./createLocationGroupsTable.js"
import { createLocationGroupStopsTable } from "./createLocationGroupStopsTable.js"
import { createLocationsGeojsonTable } from "./createLocationsGeojsonTable.js"
import { createBookingRulesTable } from "./createBookingRulesTable.js"
import { createTranslationsTable } from "./createTranslationsTable.js"
import { createFeedInfoTable } from "./createFeedInfoTable.js"
import { createAttributionsTable } from "./createAttributionsTable.js"
import { createAnalyticsTables } from "./createAnalyticsTables.js"

// The 9 tables that are populated on every import run.
// Truncated (not dropped) so that a transaction ROLLBACK restores the previous data.
// Analytics log tables are intentionally excluded — they accumulate history across runs.
const DATA_TABLES = [
  "stop_times",
  "shapes",
  "calendar_dates",
  "calendar",
  "trips",
  "routes",
  "stops",
  "agency",
  "feed_info",
]

let db = null
const getDb = () => {
  if (!db) db = new DatabaseAdapter()
  return db
}

export const createGTFSTables = async () => {
  await createAgencyTable()
  await createStopsTable()
  await createRoutesTable()
  await createTripsTable()
  await createStopTimesTable()
  await createCalendarTable()
  await createCalendarDatesTable()
  await createFareAttributesTable()
  await createFareRulesTable()
  await createTimeframesTable()
  await createRiderCategoriesTable()
  await createFareMediaTable()
  await createFareProductsTable()
  await createFareLegRulesTable()
  await createFareLegJoinRulesTable()
  await createFareTransferRulesTable()
  await createAreasTable()
  await createStopAreasTable()
  await createNetworksTable()
  await createRouteNetworksTable()
  await createShapesTable()
  await createFrequenciesTable()
  await createTransfersTable()
  await createPathwaysTable()
  await createLevelsTable()
  await createLocationGroupsTable()
  await createLocationGroupStopsTable()
  await createLocationsGeojsonTable()
  await createBookingRulesTable()
  await createTranslationsTable()
  await createFeedInfoTable()
  await createAttributionsTable()
  await createAnalyticsTables()

  // Clear previous import data so fresh rows can be loaded.
  // TRUNCATE is orders of magnitude faster than DELETE for large tables
  // (shapes and stop_times can have millions of rows).
  console.log("Truncating data tables for fresh import...")
  await getDb().run(`TRUNCATE ${DATA_TABLES.join(", ")}`)
  console.log("✓ Data tables cleared")
}
