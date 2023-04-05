import React, { memo } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

import Title from "./Title"

const RawDataTitleText = "Status Messages"

const RawDataTitleContainer = styled.div`
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
  width: "97%";
`

const RawDataTextAreaContainer = styled.div`
  min-width: 200px;
  margin-left: 20px;
  margin-right: 10px;
  margin-bottom: 20px;
`

const RawDataTextArea = styled.textarea`
  margin-left: 20px;
  width: 94%;
  height: 90%;
  border: 1px solid lightgray;
  font-size: 13px;
`

const RawDataStatusBox = (props) => {
  const { messageString } = props

  RawDataStatusBox.propTypes = {
    messageString: PropTypes.string,
  }

  return (
    <div>
      <RawDataTitleContainer>
        <Title>{RawDataTitleText}</Title>
      </RawDataTitleContainer>

      <RawDataTextAreaContainer>
        <RawDataTextArea
          rows="6"
          defaultValue={messageString}
        ></RawDataTextArea>
      </RawDataTextAreaContainer>
    </div>
  )
}

export default memo(RawDataStatusBox)
