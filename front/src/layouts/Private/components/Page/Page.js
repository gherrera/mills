import './Page.scss'
import React from 'react'

export default ({ children, id }) => (
  <div id={ id } className="page">
    { children }
  </div>
)
