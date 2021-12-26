import './CurrentClient.scss'
import React from 'react'
import { Tag } from 'antd'

export default ({ client }) => (
  <div className="current-client">
    Usted está conectado como &nbsp;&nbsp;<Tag color="#444">{ client }</Tag>
  </div>
)
