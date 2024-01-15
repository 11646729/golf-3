export const emitHeartbeatData = (socket, heartbeatReading, stillLoading) => {
  // Guard clauses
  if (socket == null) return
  if (heartbeatReading == null) return
  if (stillLoading == null) return

  try {
    socket.emit("FromIsLoadingHeartbeatData", stillLoading)
    socket.emit("FromHeartbeatAPI", heartbeatReading)
  } catch (error) {
    console.log("Error in emitHeartbeatData: ", error)
  }
}

export default emitHeartbeatData
