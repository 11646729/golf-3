import { Component } from "react"
import PropTypes from "prop-types"

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("MapErrorBoundary caught an error:", error, errorInfo)
    // You can also log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "750px",
            width: "750px",
            border: "1px solid #ccc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            padding: "20px",
          }}
        >
          <h3 style={{ color: "#d32f2f", marginBottom: "10px" }}>
            Map Loading Error
          </h3>
          <p style={{ color: "#666", marginBottom: "10px" }}>
            An error occurred while loading the golf courses map.
          </p>
          <details style={{ marginTop: "15px", fontSize: "12px" }}>
            <summary style={{ cursor: "pointer", color: "#1976d2" }}>
              Error Details
            </summary>
            <pre
              style={{
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
                maxHeight: "200px",
              }}
            >
              {this.state.error?.toString()}
            </pre>
          </details>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "15px" }}>
            Check your browser console for more information or contact support.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

MapErrorBoundary.propTypes = {
  children: PropTypes.node,
}

export default MapErrorBoundary
