import './Manage.scss'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Row, Col, Button } from 'antd'
import { Page, PageContent, PageHeader } from '../../layouts/Private/components'
import { TabForms } from './components'

class Manage extends Component {
  state = {
      breadcrumbs: this.getBreadcrumbs(),
      title: '',
      keyTab: Math.random()
  }

  componentDidMount() {
    
  }

  getBreadcrumbs() {

      const breadcrumbs = [
          { title: 'Gestión', icon: 'form', link: '/manage', onClick: this.clickMenuDesign.bind(this) }
      ]

      return breadcrumbs
  }

  clickMenuDesign() {
      this.setState({ keyTab: Math.random(), breadcrumbs: this.getBreadcrumbs(), title: '' })
  }

  refreshBreadCrumbs({ title, onClick, link, breadcrumbs, nav} ) {
      if(breadcrumbs) {
        this.setState({ breadcrumbs, title })
      }else {
        let b = this.state.breadcrumbs
        b.push({ title, icon: 'form', onClick, link })
        this.setState({ breadcrumbs: b, title: nav ? nav : title })
      }
  }

  render() {
    const { breadcrumbs, title, keyTab } = this.state
    const { currentUser, t, match } = this.props

    return (
      <div className="manage-page">
        <Page>
          <PageHeader
            title={title}
            breadcrumbs={breadcrumbs}
            />
          <PageContent>
              <Row className="wrapper">
                  <TabForms key={keyTab+match.params.status} status={match.params.status ? match.params.status : null} />
              </Row>
          </PageContent>
        </Page>
      </div>
    )
  }
}
export default withRouter(Manage)