export const generateData = (mockType, indexCount) => {
  // const indexCount = 1
  const precision = 100 // 2 decimals

  let randomNum =
    Math.floor(
      Math.random() * (10 * precision - 1 * precision) + 1 * precision
    ) /
    (1 * precision)

  const mockWeatherMessage = [
    {
      index: indexCount,
      version: "1.0",
      readingTime: "2023-12-18T09:48:28.000Z",
      location: "Clandeboye Golf Course",
      temperatureValue: randomNum,
      latitude: "54.665577",
      longitude: "-5.766897",
    },
  ]

  return mockWeatherMessage
}
