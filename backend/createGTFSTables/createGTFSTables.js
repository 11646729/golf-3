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

export const createGTFSTables = async (req, res) => {
  await createAgencyTable(res)
  await createStopsTable(res)
  await createRoutesTable(res)
  await createTripsTable(res)
  await createStopTimesTable(res)
  await createCalendarTable(res)
  await createCalendarDatesTable(res)
  await createFareAttributesTable(res)
  await createFareRulesTable(res)
  await createTimeframesTable(res)
  await createRiderCategoriesTable(res)
  await createFareMediaTable(res)
  await createFareProductsTable(res)
  await createFareLegRulesTable(res)
  await createFareLegJoinRulesTable(res)
  await createFareTransferRulesTable(res)
  await createAreasTable(res)
  await createStopAreasTable(res)
  await createNetworksTable(res)
  await createRouteNetworksTable(res)
  await createShapesTable(res)
  await createFrequenciesTable(res)
  await createTransfersTable(res)
  await createPathwaysTable(res)
  await createLevelsTable(res)
  await createLocationGroupsTable(res)
  await createLocationGroupStopsTable(res)
  await createLocationsGeojsonTable(res)
  await createBookingRulesTable(res)
  await createTranslationsTable(res)
  await createFeedInfoTable(res)
  await createAttributionsTable(res)
  await createAnalyticsTables(res)
}
