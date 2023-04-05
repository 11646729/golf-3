import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Title from "./Title"

const TemperaturesTableContainer = styled.div`
  min-width: 200px;
  margin-left: 20px;
  margin-right: 10px;
  margin-bottom: 20px;
`

const TemperaturesTableTitleContainer = styled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const TemperaturesTable = (props) => {
  const { temperaturesTableTitle } = props

  TemperaturesTable.propTypes = {
    temperaturesTableTitle: PropTypes.string,
  }

  return (
    <div>
      <TemperaturesTableTitleContainer>
        <Title>{temperaturesTableTitle}</Title>
      </TemperaturesTableTitleContainer>
      <TemperaturesTableContainer>
        temperatures selection
      </TemperaturesTableContainer>
    </div>
  )
}

export default memo(TemperaturesTable)
