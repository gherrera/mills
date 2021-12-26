import './Header.scss'
import React from 'react'
import { Link } from 'react-router-dom'
import { Layout, Col, Menu, Button, Dropdown, Icon } from 'antd'
import { CurrentUser, Logo, Navigation } from '../'

const { Header } = Layout

export default ({ currentUser, logoutHandler  }) => (
  <Header id="header" theme="dark">
    <Col span={3}>
      {/*<Logo clientId={ currentUser.client.id } />*/}
    </Col>
    <Col span={3}>
      <CurrentUser
        currentUser={ currentUser }
        logoutHandler={ logoutHandler }
        />
    </Col>
    <Col span={12}>
      <Navigation currentUser={ currentUser } />
    </Col>
  </Header>
)
