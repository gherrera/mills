import './Maintenance.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { Page, PageContent, PageHeader } from '../../layouts/Private/components'
import { Setup, Dashboard } from './components'

class Maintenance extends Component {
  state = {
    breadcrumbs: []
  }

  getBreadcrumbs() {
    const { t, match } = this.props
    if(match.params.action === 'setup' || match.params.action === 'new') {
      return [
        { title: 'Setup', icon: 'appstore'},
      ]
    }else if(match.params.action === 'PENDING') {
      return [
        { title: 'Proyectos Pendientes', icon: 'appstore' },
      ]
    }else if(match.params.action === 'STARTED') {
      return [
        { title: 'Proyectos En curso', icon: 'appstore' },
      ]
    }else if(match.params.action === 'FINISHED'){
      return [
        { title: 'Proyectos Realizados', icon: 'appstore' },
      ]
    }else {
      return [
        { title: 'Dashboard', icon: 'appstore' },
      ]
    }
  }

  componentDidMount() {
    const breadcrumbs = this.getBreadcrumbs()
    this.setState({
      breadcrumbs
    })
  }

  render() {
    const { breadcrumbs } = this.state
    const { currentUser, t, match } = this.props

    return (
      <div className="maintenance">
        <PageHeader
            breadcrumbs={breadcrumbs}
            />
        <Page>
          <PageContent>
            {(match.params.action === 'setup' || match.params.action === 'new' || match.params.action === 'PENDING' || match.params.action === 'STARTED' || match.params.action === 'FINISHED') ?
                <Setup key={match.params.action} currentUser={currentUser} action={match.params.action} />
              : match.params.action === undefined &&
                <Dashboard/>
            }
          </PageContent>
        </Page>
      </div>
    )
  }
}

export default withTranslation()(withRouter(Maintenance))
