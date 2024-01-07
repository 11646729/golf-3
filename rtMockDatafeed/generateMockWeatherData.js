export const generateMockWeatherData = (mockType, indexCount) => {
  const precision = 100 // 2 decimals

  let randomNum =
    Math.floor(
      Math.random() * (10 * precision - 1 * precision) + 1 * precision
    ) /
    (1 * precision)

  try {
    let mockWeatherMessageBody = []
    let latestReading = {
      index: 1,
      timeNow: new Date(),
      version: 1.0,
      readingTime: new Date(),
      location: "Clandeboye Golf Course",
      temperatureValue: randomNum,
      latitude: 54.665577,
      longitude: -5.766897,
    }
    mockWeatherMessageBody.push(latestReading)

    return mockWeatherMessageBody
  } catch (error) {
    console.log("Error in generateMockWeatherData: ", error)
    return null
  }
}
