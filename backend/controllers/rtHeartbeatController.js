export const emitHeartbeatData = (socket, heartbeatReading, stillLoading) => {
  // Guard clauses
  if (socket == null) return
  if (heartbeatReading == null) return
  if (stillLoading == null) return

  try {
    socket.emit("FromHeartbeatAPI", heartbeatReading)
    socket.emit("FromIsLoadingHeartbeatData", stillLoading)
  } catch (error) {
    console.log("Error in emitHeartbeatData: ", error)
  }
}

export default emitHeartbeatData
