import { useState, useEffect } from "react"
import GolfCoursesTable from "../components/GolfCoursesTable"
import GolfCoursesMap from "../components/GolfCoursesMap"
import MapErrorBoundary from "../components/MapErrorBoundary"
import { getGolfCoursesData } from "../functionHandlers/loadGolfCoursesDataHandler"
import "../styles/golfcourses.scss"

// -------------------------------------------------------
// React Controller component
// -------------------------------------------------------
const GolfCoursesPage = () => {
  const [golfcourses, setGolfCoursesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    getGolfCoursesData("http://localhost:4000/api/golf/getGolfCourses")
      .then((returnedData) => {
        setGolfCoursesData(returnedData)
        setLoadError(null)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error loading golf courses data:", err)
        setLoadError(err.message || "Failed to load golf courses")
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="golfcoursescontainer">
      <div className="golfcoursestablecontainer">
        {loadError && (
          <div
            style={{
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: "4px",
              color: "#c62828",
            }}
          >
            <strong>Error loading golf courses:</strong> {loadError}
          </div>
        )}
        <GolfCoursesTable golfcourses={golfcourses} />
      </div>
      <div className="golfcoursesmapcontainer">
        <MapErrorBoundary>
          <GolfCoursesMap isLoading={isLoading} golfcourses={golfcourses} />
        </MapErrorBoundary>
      </div>
    </div>
  )
}

export default GolfCoursesPage
