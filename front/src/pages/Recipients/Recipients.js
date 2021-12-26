import './Recipients.scss'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Row } from 'antd'
import { Page, PageContent, PageHeader } from '../../layouts/Private/components'
import { TabRecipients } from './components'

class Recipients extends Component {
  state = {
      breadcrumbs: this.getBreadcrumbs(),
      title: '',
      keyTab: Math.random()
  }

  componentDidMount() {
    
  }

  getBreadcrumbs() {

      const breadcrumbs = [
          { title: 'Destinatarios', icon: 'user', link: '/recipients', onClick: this.clickMenuRecipients.bind(this) }
      ]

      return breadcrumbs
  }

  clickMenuRecipients() {
      this.setState({ keyTab: Math.random(), breadcrumbs: this.getBreadcrumbs(), title: '' })
  }

  refreshBreadCrumbs({ title, onClick, link, breadcrumbs, nav} ) {
      if(breadcrumbs) {
        this.setState({ breadcrumbs, title })
      }else {
        let b = this.state.breadcrumbs
        b.push({ title, icon: 'user', onClick, link })
        this.setState({ breadcrumbs: b, title: nav ? nav : title })
      }
  }

  render() {
    const { breadcrumbs, title, keyTab } = this.state
    const { currentUser, t, match } = this.props

    return (
      <div className="recipients-page">
        <Page>
          <PageHeader
            title={title}
            breadcrumbs={breadcrumbs}
            />
          <PageContent>
              <Row className="wrapper">
                  <TabRecipients key={keyTab+match.params.status} />
              </Row>
          </PageContent>
        </Page>
      </div>
    )
  }
}
export default withRouter(Recipients)