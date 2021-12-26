import './Content.scss'
import React from 'react'

export default ({ children }) => (
  <div id="content" className="login-animation">
    <div className="content-inner">
      { children }
    </div>
  </div>
)
