import fs from "fs"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/rtNews/
// -------------------------------------------------------
export var index = (req, res) => {
  res.send({ response: "Real Time News Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Prepare empty RTNews Table ready to import events
// Path: localhost:4000/api/rtnews/prepareEmptyRTNewsTable
// -------------------------------------------------------
export const prepareEmptyRTNewsTable = (req, res) => {}

// -------------------------------------------------------
// Local function to create empty RTNews Table in the database
// -------------------------------------------------------
const createRTNewsTable = (db) => {}

// -------------------------------------------------------
// Local function to delete all RTNews records from Table in database
// -------------------------------------------------------
const deleteRTNewsItems = (db) => {}

// -------------------------------------------------------
// Import RTNews Items from a File to the Table in the Database
// Path: localhost:4000/api/rtnews/importRTNewsItemsFromFile
// -------------------------------------------------------
export const importRTNewsItemsFromFile = (req, res) => {}

// -------------------------------------------------------
// Local function for importRTNewsItemsFromFile
// -------------------------------------------------------
const populateRTNewsTable = (events) => {}

// -------------------------------------------------------
// Get all Real Time News Items from SQLite database
// Path: localhost:4000/api/rtnews/getRTNews
// -------------------------------------------------------
export const getRTNewsItems = (req, res) => {
  console.log("Here")
  // return dummyNewsEvents
}

export default getRTNewsItems
