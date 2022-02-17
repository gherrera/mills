import './Logo.scss'
import React from 'react'
import { Link } from 'react-router-dom'
import apiConfig from '../../../../config/api'

export default ({ currentUser }) => (
  <div className="logo">
    <Link to={ '/' } >
      <img src="/logo.png" alt=""/>
    </Link>
  </div>
)
