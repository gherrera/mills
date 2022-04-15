import './Header.scss'
import React from 'react'
import { Layout, Col } from 'antd'
import { CurrentUser, Logo, Navigation } from '../'

const { Header } = Layout

export default ({ currentUser, logoutHandler, currentPage }) => (
  <Header id="header" theme="dark">
    <Col span={6}>
      <Logo clientId={ currentUser } />
    </Col>
    <Col span={12}>
      { currentUser.type !== 'DASHBOARD' &&
        <Navigation currentUser={ currentUser } currentPage={currentPage} />
      }
    </Col>
    <Col span={6}>
      <CurrentUser
        currentUser={ currentUser }
        logoutHandler={ logoutHandler }
        />
    </Col>
  </Header>
)
