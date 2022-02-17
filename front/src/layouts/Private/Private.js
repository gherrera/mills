import './Private.scss'
import React, { Component } from 'react'
import ReactGA from 'react-ga'
import { withRouter } from 'react-router-dom'
import { Layout } from 'antd'
import { Content, Footer, Header } from './components'

class LayoutPrivate extends Component {
  state = {
    currentPageId: ''
  }

  async componentDidMount() {
    const { currentUser } = this.props

    //await ReactGA.initialize('UA-156566165-1')

    //if (currentUser.cliente.abreviado !== 'demostraciones' && currentUser.cliente.abreviado !== 'demo') {
      //await ReactGA.pageview(window.location.pathname + window.location.search)
    //}

    const currentPageId = this.setCurrentPageId()
    this.setState({ currentPageId })
  }

  async componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      const { currentUser } = this.props
      const currentPageId = this.setCurrentPageId()

      await this.setState({ currentPageId })
    }
  }

  setCurrentPageId() {
    const pathname = this.props.location.pathname.substr(1)
    const currentPage = pathname.replace('/','-')
    const currentPageId = pathname === '' ? 'inicio' : currentPage

    document.getElementsByClassName('layout-private')[0].id = currentPageId

    return currentPageId
  }

  render() {
    const { children, currentUser, logoutHandler } = this.props
    const { currentPageId } = this.state

    return (
      <Layout className="layout-private">
        <Header
          currentUser={ currentUser }
          logoutHandler= { logoutHandler }
          currentPage = {currentPageId}
          />
        <Content>
          { children }
        </Content>
        <Footer currentUser={ currentUser } />
      </Layout>
    )
  }
}

export default withRouter(props => <LayoutPrivate {...props} />)
