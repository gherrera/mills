import './PageBottomBar.scss'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BackTop } from 'antd'
import { Breadcrumbs } from '../'

export default ({ breadcrumbs }) => {
  const { t } = useTranslation()

  const handleScrollToTop = (duration) => {
    const scrollStep = -window.scrollY / (duration / 15)
    const scrollInterval = setInterval(function(){
      if ( window.scrollY !== 0 ) {
          window.scrollBy( 0, scrollStep )
      } else clearInterval(scrollInterval)
    },15)
  }

  return (
    <div className="page-bottom-bar">
      <Breadcrumbs items={ breadcrumbs } />
      <div className="go-to-top-link" onClick={ () => handleScrollToTop(400) }>{ t('messages.aml.goToTop') } &#x21A5;</div>
    </div>
  )
}
