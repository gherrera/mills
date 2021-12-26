import './InfoIcon.scss'
import React from 'react'
import { Icon, Tooltip } from 'antd'

const InfoIcon = ({ placement = 'top', text }) => {

  return (
    <Tooltip className="info-icon" placement={ placement } title={ text }>
      <Icon type="info-circle" />
    </Tooltip>
  )
}

export default InfoIcon
