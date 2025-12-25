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
}
