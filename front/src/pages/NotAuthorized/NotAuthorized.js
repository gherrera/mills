import './NotAuthorized.scss'
import React, { Component } from 'react'
import { Page, PageBottomBar, PageHeader, PageContent, PageFooter, PageTopBar } from '../../layouts/Private/components'
import stopHandImg from './stop-hand.png'

class NotAuthorized extends Component {
  state = {
    breadcrumbs: this.getBreadcrumbs(),
  }

  getBreadcrumbs() {
    const { t } = this.props

    const breadcrumbs = [
      { title: 'Acceso Restringido', icon: 'branches', link: '/' }
    ]

    return breadcrumbs
  }

  render() {
    const breadcrumbs = this.state

    return (
      <div className="not-authorized">
        <PageTopBar breadcrumbs={ breadcrumbs } />
        <Page>
        <PageHeader title="Acceso Restringido" description="Usted no tiene permisos para acceder al contenido solicitado" icon="stop" />
        <PageContent>
          <img src={ stopHandImg } />
        </PageContent>
        </Page>
        <PageBottomBar breadcrumbs={ breadcrumbs } />
      </div>
    )
  }
}

export default NotAuthorized
