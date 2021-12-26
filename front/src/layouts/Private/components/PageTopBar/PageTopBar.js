import './PageTopBar.scss'
import React from 'react'
import { Breadcrumbs } from '../'

export default ({ breadcrumbs, children=null }) => {
  return (
    <div className="page-top-bar">
      <div className="page-top-bar-inner">
        { breadcrumbs !== null &&
          <Breadcrumbs items={ breadcrumbs } />
        }
        { children !== null && children }
      </div>
    </div>
  )
}
