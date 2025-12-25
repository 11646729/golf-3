import { prepareEmptyAgencyTable } from "./prepareEmptyAgencyTable.js"
import { prepareEmptyCalendarDatesTable } from "./prepareEmptyCalendarDatesTable.js"
import { prepareEmptyStopsTable } from "./prepareEmptyStopsTable.js"

export const prepareEmptyGTFSTables = async (req, res) => {
  await prepareEmptyAgencyTable(res)
  await prepareEmptyCalendarDatesTable(res)
  await prepareEmptyStopsTable(res)
}
