import React, { memo } from "react"
import { Text } from "react-konva"

const TestAppStars = () => {
  const handleTextClick = (e) => {
    const id = e.target.id()
    console.log(id)
  }

  return (
    <Text
      id={"2"}
      fontSize={12}
      text={"Open Drawer"}
      stroke="blue"
      strokeWidth={0.5}
      x={20}
      y={20}
      align="left"
      verticalAlign="middle"
      onClick={handleTextClick}
    />
  )
}

export default memo(TestAppStars)
