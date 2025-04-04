// import fs from "fs"
// import { openSqlDbConnection, closeSqlDbConnection } from "../fileUtilities.js"

// -------------------------------------------------------
// Catalogue Home page
// Path: localhost:4000/api/belfastharbourmovements/
// -------------------------------------------------------
export var index = (req, res) => {
  res
    .send({ response: "Belfast Harbour Movement Catalog home page" })
    .status(200)
}

// -------------------------------------------------------
// Get all Belfast Harbour Movements from SQLite database
// Path: localhost:4000/api/golf/getBelfastHarbourMovements
// -------------------------------------------------------
export const getBelfastHarbourMovements = (req, res) => {
  return console.log(
    "In belfastHarbourMovementsController.js file TODO Here - enable SQL function"
  )
}

export default getBelfastHarbourMovements
