import './PageHeader.scss'
import React from 'react'
import { Icon, Row, Col } from 'antd'
import { Breadcrumbs } from '../'

export default ({ title, breadcrumbs }) => (
  <Row className="page-header">
    <Col xs={24} sm={24} md={breadcrumbs && breadcrumbs.length === 2 ? 18 : 4} lg={breadcrumbs && breadcrumbs.length === 2 ? 18 : 4}>
      { breadcrumbs &&
          <Breadcrumbs items={ breadcrumbs } />
      }
    </Col>
    <Col xs={24} sm={24} md={breadcrumbs && breadcrumbs.length === 2 ? 6 : 20} lg={breadcrumbs && breadcrumbs.length === 2 ? 6 : 16} style={{textAlign: breadcrumbs && breadcrumbs.length === 2 ? 'right' : 'center'}}>
      <h1 className="page-title">{ title }</h1>
    </Col>
  </Row>
)
