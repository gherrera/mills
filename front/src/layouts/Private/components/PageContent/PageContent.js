import './PageContent.scss'
import React from 'react'

export default ({ children, className }) => (
  <div className={ 'page-content ' + className }>
    { children }
  </div>
)
