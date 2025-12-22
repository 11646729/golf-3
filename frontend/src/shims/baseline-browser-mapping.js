// Shim to suppress baseline-browser-mapping old data warnings by default
// Import the original library via a deep path to avoid our alias
import * as original from "baseline-browser-mapping/dist/index.js"

export function getCompatibleVersions(options = {}) {
  const opts = { suppressWarnings: true, ...options }
  return original.getCompatibleVersions(opts)
}

export function getAllVersions(options = {}) {
  const opts = { suppressWarnings: true, ...options }
  return original.getAllVersions(opts)
}

// Re-export everything else (types/values) just in case
export * from "baseline-browser-mapping/dist/index.js"
