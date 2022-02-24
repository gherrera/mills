import './Maintenance.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { Page, PageContent, PageHeader } from '../../layouts/Private/components'
import { Setup } from './components'

class Maintenance extends Component {
  state = {
    breadcrumbs: []
  }

  getBreadcrumbs() {
    const { t, match } = this.props

    if(match.params.action === 'setup' || match.params.action === 'new') {
      return [
        { title: 'Setup', icon: 'appstore', link: '/maintenance/setup' },
      ]
    }else {
      return [
        { title: 'Dashboard', icon: 'appstore', link: '/maintenance' },
      ]
    }
  }

  componentDidMount() {
    const { match } = this.props
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
            {(match.params.action === 'setup' || match.params.action === 'new' || match.params.action === 'PENDING' || match.params.action === 'STARTED' || match.params.action === 'FINISHED') &&
              <Setup key={match.params.action} currentUser={currentUser} action={match.params.action} />
            }
          </PageContent>
        </Page>
      </div>
    )
  }
}

export default withTranslation()(withRouter(Maintenance))
