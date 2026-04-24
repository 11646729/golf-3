import express from "express"
import {
  index,
  createCrimesTable,
  importCrimesData,
  getCrimesData,
  getCrimesImportStatus,
} from "../controllers/crimesController.js"

var crimesRouter = express.Router()

// ---------------------------------------------------
// Crimes Routes
// ---------------------------------------------------
// GET catalogue home page
crimesRouter.get("/", index)

// Prepare the crimes table in the database
crimesRouter.post("/createCrimesTable", createCrimesTable)

// POST all Crimes data into the database
crimesRouter.post("/importCrimesData", importCrimesData)

// GET current import status (last updated timestamp)
crimesRouter.get("/importStatus", getCrimesImportStatus)

// GET all Crimes data from the database
crimesRouter.get("/getCrimes", getCrimesData)

export default crimesRouter
