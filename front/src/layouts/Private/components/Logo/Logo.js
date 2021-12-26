import './Logo.scss'
import React from 'react'
import apiConfig from '../../../../config/api'

export default ({ clientId }) => (
  <div className="logo">
    <img src={ apiConfig.url + '/getImageClient?clientId=' + clientId } alt=""/>
  </div>
)
