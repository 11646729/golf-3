// How it works:
// This uses the Ray Casting algorithm, which counts how many times a horizontal line from the point crosses the edges of the polygon.
// If the number of crossings is odd, the point is inside. If even, it’s outside.

function isPointInPolygon(point, polygon) {
  const { lat, lng } = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat,
      yi = polygon[i].lng
    const xj = polygon[j].lat,
      yj = polygon[j].lng

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

// Example usage:
const point = { lat: 37.7749, lng: -122.4194 } // San Francisco

const polygon = [
  { lat: 37.7, lng: -122.5 },
  { lat: 37.75, lng: -122.48 },
  { lat: 37.78, lng: -122.41 },
  { lat: 37.73, lng: -122.35 },
  { lat: 37.7, lng: -122.4 },
]

console.log(isPointInPolygon(point, polygon)) // true or false

// VISIBLE AREA
// WhiteAbbey: 54.671091, -5.900055
// Eden: 54.727539, -5.746405
// Royal Belfast: 54.664580, -5.780801
// Seahill: 54.670891, -5.761561

// Web page with a list of vessels in Port of Belfast
// https://www.vesselfinder.com/ports/GBBEL001
