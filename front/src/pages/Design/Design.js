import './Design.scss'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Wrapper } from './layout'
import { Page, PageContent,  PageHeader } from '../../layouts/Private/components'
import { TabForms } from './components'


class Design extends Component {
  state = {
    breadcrumbs: this.getBreadcrumbs(),
    title: '',
    keyTab: Math.random()
	}

  componentDidMount() {

  }

  getBreadcrumbs() {

    const breadcrumbs = [
      { title: 'Diseño', icon: 'form', link: '/design', onClick: this.clickMenuDesign.bind(this) }
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
		const { currentUser, t } = this.props

		return (
      <div className="design-page">
        <Page>
          <PageHeader
            title={title}
            breadcrumbs={breadcrumbs}
            />
          <PageContent>
            <Wrapper>
              <TabForms key={keyTab} currentUser={currentUser} breadcrumbs={breadcrumbs} refreshBreadCrumbs={this.refreshBreadCrumbs.bind(this)} />
            </Wrapper>
          </PageContent>
        </Page>
      </div>
    )
  }
}
export default withRouter(Design)
