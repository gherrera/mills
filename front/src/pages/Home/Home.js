import './Home.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { Col, Row, Card, Icon, Spin } from 'antd'
import { Page, PageContent } from '../../layouts/Private/components'
import { getMolinosPromise } from '../Maintenance/promises'
import moment from 'moment'

class Home extends Component {
  state = {
    molinos: null
  }

  async componentDidMount() {
    const { currentUser } = this.props
    getMolinosPromise().then(m => {
      let ms = []
      m.map(molino => {
        if(molino.statusAdmin === 'ACTIVE' && molino.status === 'STARTED') {
          ms.push(molino)
        }
      })
      this.setState({
        molinos: ms
      })
    })
  }

  render() {
    const { t } = this.props
    const { molinos } = this.state

    return (
      <div className="home">
        <Page>
          <PageContent>
            <Row className="module">
              <Col xs={9} sm={7} lg={3}>
                <Link to="/maintenance" style={{position:'relative'}}>
                  <Icon type="tool" theme="filled" />
                  <div className="submodule name">
                      <span>Mantenimiento</span>
                  </div>
                </Link>
              </Col>
              <Col xs={15} sm={17} lg={15} className="submodule" style={{marginBottom: 10}}>
                <div className="content">
                  <Card title="Notificaciones" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', padding: '2px 6px'}}>
                    { molinos === null ?
                      <Spin/>
                      :
                      molinos.map(molino =>
                        <Row style={{marginBottom: 10}}>
                          La Faena de <strong>{molino.faena.client.name}</strong> con OT <strong>{molino.ordenTrabajo}</strong> con fecha de inicio {moment(molino.startDate).format('DD/MM/YYYY')} se encuentra en curso, con un avance del <strong>{Math.round(molino.percentage*100)}%</strong>.
                        </Row>  
                      )}
                  </Card>
                </div>
              </Col>
              <Col xs={24} sm={24} lg={6} className="submodule">
                <div className="content">
                  <Card title="Acciones rápidas" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', padding: '2px 6px'}}>
                    <Row>
                      <Link to="/maintenance/new">
                        Ingrese nueva faena
                      </Link>
                    </Row>
                    <Row>
                      <Link to="/maintenance/STARTED">
                        Faenas en curso
                      </Link>
                    </Row>
                  </Card>
                </div>
              </Col>
            </Row>
            <Row className="module">
              <Col xs={9} sm={7} lg={3}>
                <Link style={{position:'relative'}}>
                  <Icon type="user" />
                  <div className="submodule name">
                    <span>RRHH</span>
                  </div>
                </Link>
              </Col>
              <Col xs={15} sm={17} lg={15} className="submodule" style={{marginBottom: 10}}>
                <div className="content">
                  <Card title="Notificaciones" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', minHeight: 22, padding: '2px 6px'}}>

                  </Card>
                </div>
              </Col>
              <Col span={6} xs={24} sm={24} lg={6} className="submodule">
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
