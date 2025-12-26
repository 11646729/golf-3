import { prepareEmptyAgencyTable } from "./prepareEmptyAgencyTable.js"
import { prepareEmptyCalendarDatesTable } from "./prepareEmptyCalendarDatesTable.js"
import { prepareEmptyStopsTable } from "./prepareEmptyStopsTable.js"
import { prepareEmptyTripsTable } from "./prepareEmptyTripsTable.js"
import { prepareEmptyAreaTable } from "./prepareEmptyAreaTable.js"
import { prepareEmptyRoutesTable } from "./prepareEmptyRoutesTable.js"
import { prepareEmptyFeedInfoTable } from "./prepareEmptyFeedInfoTable.js"
import { prepareEmptyShapesTable } from "./prepareEmptyShapesTable.js"
import { prepareEmptyCalendarTable } from "./prepareEmptyCalendarTable.js"
import { prepareEmptyStopTimesTable } from "./prepareEmptyStopTimesTable.js"
import { prepareEmptyFareAttributesTable } from "./prepareEmptyFareAttributesTable.js"
import { prepareEmptyFareRulesTable } from "./prepareEmptyFareRulesTable.js"
import { prepareEmptyTimeframesTable } from "./prepareEmptyTimeframesTable.js"
import { prepareEmptyRiderCategoriesTable } from "./prepareEmptyRiderCategoriesTable.js"
import { prepareEmptyFareMediaTable } from "./prepareEmptyFareMediaTable.js"
import { prepareEmptyFareProductsTable } from "./prepareEmptyFareProductsTable.js"
import { prepareEmptyFareLegRulesTable } from "./prepareEmptyFareLegRulesTable.js"
import { prepareEmptyFareLegJoinRulesTable } from "./prepareEmptyFareLegJoinRulesTable.js"
import { prepareEmptyFareTransferRulesTable } from "./prepareEmptyFareTransferRulesTable.js"
import { prepareEmptyStopAreasTable } from "./prepareEmptyStopAreasTable.js"
import { prepareEmptyNetworksTable } from "./prepareEmptyNetworksTable.js"
import { prepareEmptyRouteNetworksTable } from "./prepareEmptyRouteNetworksTable.js"
import { prepareEmptyFrequenciesTable } from "./prepareEmptyFrequenciesTable.js"
import { prepareEmptyTransfersTable } from "./prepareEmptyTransfersTable.js"
import { prepareEmptyPathwaysTable } from "./prepareEmptyPathwaysTable.js"
import { prepareEmptyLevelsTable } from "./prepareEmptyLevelsTable.js"
import { prepareEmptyLocationGroupsTable } from "./prepareEmptyLocationGroupsTable.js"
import { prepareEmptyLocationGroupStopsTable } from "./prepareEmptyLocationGroupStopsTable.js"
import { prepareEmptyLocationsGeojsonTable } from "./prepareEmptyLocationsGeojsonTable.js"
import { prepareEmptyBookingRulesTable } from "./prepareEmptyBookingRulesTable.js"
import { prepareEmptyTranslationsTable } from "./prepareEmptyTranslationsTable.js"
import { prepareEmptyAttributionsTable } from "./prepareEmptyAttributionsTable.js"

export const prepareEmptyGTFSTables = async (req, res) => {
  await prepareEmptyAgencyTable(res)
  await prepareEmptyCalendarDatesTable(res)
  await prepareEmptyStopsTable(res)
  await prepareEmptyTripsTable(res)
  await prepareEmptyAreaTable(res)
  await prepareEmptyRoutesTable(res)
  await prepareEmptyFeedInfoTable(res)
  await prepareEmptyShapesTable(res)
  await prepareEmptyCalendarTable(res)
  await prepareEmptyStopTimesTable(res)
  await prepareEmptyFareAttributesTable(res)
  await prepareEmptyFareRulesTable(res)
  await prepareEmptyTimeframesTable(res)
  await prepareEmptyRiderCategoriesTable(res)
  await prepareEmptyFareMediaTable(res)
  await prepareEmptyFareProductsTable(res)
  await prepareEmptyFareLegRulesTable(res)
  await prepareEmptyFareLegJoinRulesTable(res)
  await prepareEmptyFareTransferRulesTable(res)
  await prepareEmptyStopAreasTable(res)
  await prepareEmptyNetworksTable(res)
  await prepareEmptyRouteNetworksTable(res)
  await prepareEmptyFrequenciesTable(res)
  await prepareEmptyTransfersTable(res)
  await prepareEmptyPathwaysTable(res)
  await prepareEmptyLevelsTable(res)
  await prepareEmptyLocationGroupsTable(res)
  await prepareEmptyLocationGroupStopsTable(res)
  await prepareEmptyLocationsGeojsonTable(res)
  await prepareEmptyBookingRulesTable(res)
  await prepareEmptyTranslationsTable(res)
  await prepareEmptyAttributionsTable(res)
}
