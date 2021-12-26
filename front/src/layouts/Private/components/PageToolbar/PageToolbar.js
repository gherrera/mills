import './PageToolbar.scss'
import React from 'react'

export default ({ additionalClassName, children }) => (
  <div className={ additionalClassName ? 'page-toolbar ' + additionalClassName : 'page-toolbar' }>
    { children }
  </div>
)
