import GolfCoursesTable from "../components/GolfCoursesTable"
import GolfCoursesMap from "../components/GolfCoursesMap"
import GolfCoursesImportButton from "../components/GolfCoursesImportButton"
import useGolfCourses from "../hooks/useGolfCourses"
import "../styles/golfcourses.scss"

const GolfCoursesPage = () => {
  const {
    golfcourses,
    isLoading,
    loadError,
    fetchStatus,
    lastImportDate,
    handleFetchData,
  } = useGolfCourses()

  return (
    <div>
      <GolfCoursesImportButton
        fetchStatus={fetchStatus}
        lastImportDate={lastImportDate}
        onFetch={handleFetchData}
      />
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
          <GolfCoursesMap isLoading={isLoading} golfcourses={golfcourses} />
        </div>
      </div>
    </div>
  )
}

export default GolfCoursesPage
