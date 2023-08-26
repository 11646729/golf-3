import fs from "fs"
import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"
// import { dummyNewsEvents } from "../raw_data/rtCalendarData.json"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/rtNews/
// -------------------------------------------------------
export var index = (req, res) => {
  res.send({ response: "Real Time News Catalog home page" }).status(200)
}

// -------------------------------------------------------
// Get all Real Time News Items from SQLite database
// Path: localhost:4000/api/rtnews/getRTNews
// -------------------------------------------------------
export const getNewsItemsFromDatabase = (req, res) => {
  console.log("Here")
  // return dummyNewsEvents
}
