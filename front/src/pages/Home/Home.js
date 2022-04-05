import './Home.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { Col, Row, Card, Icon } from 'antd'
import { Page, PageContent } from '../../layouts/Private/components'

class Home extends Component {
  state = {
    
  }

  async componentDidMount() {
    const { currentUser } = this.props
  }

  render() {
    const { t } = this.props

    return (
      <div className="home">
        <Page>
          <PageContent>
            <Row className="module">
              <Col span={3} xs={8} sm={6} lg={3} style={{height:'100%'}}>
                <Link to="/maintenance" style={{position:'relative'}}>
                  <Icon type="tool" theme="filled" />
                  <div className="submodule name">
                      <span>Mantenimiento</span>
                  </div>
                </Link>
              </Col>
              <Col span={15} xs={16} sm={18} lg={15} className="submodule" style={{marginBottom: 10, height:'100%'}}>
                <div className="content">
                  <Card title="Notificaciones" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', padding: '2px 6px'}}>

                  </Card>
                </div>
              </Col>
              <Col span={6} xs={24} sm={24} lg={6} className="submodule">
                <div className="content">
                  <Card title="Acciones rápidas" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', padding: '2px 6px'}}>
                    <Link to="/maintenance/new">
                      Ingrese nueva faena
                    </Link>
                  </Card>
                </div>
              </Col>
            </Row>
            <Row className="module">
              <Col span={3} xs={8} sm={6} lg={3} style={{height:'100%'}}>
                <Link style={{position:'relative'}}>
                  <Icon type="user" />
                  <div className="submodule name">
                    <span>RRHH</span>
                  </div>
                </Link>
              </Col>
              <Col span={15} xs={16} sm={18} lg={15} className="submodule" style={{height:'100%'}}>
                <div className="content">
                  <Card title="Notificaciones" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', minHeight: 22, padding: '2px 6px'}}>

                  </Card>
                </div>
              </Col>
              <Col span={6} xs={24} sm={24} lg={6} className="submodule" style={{height:'100%'}}>
                <div className="content">
                  <Card title="Acciones rápidas" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', minHeight: 22, padding: '2px 6px'}}>

                  </Card>
                </div>
              </Col>
            </Row>
          </PageContent>
        </Page>
      </div>
    )
  }
}

export default withTranslation()(withRouter(Home))
