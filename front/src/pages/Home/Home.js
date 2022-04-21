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
            <Row className="title-mills">
              <Col span={16}>
                <div>MILLS OPERATIONAL SYSTEM</div>
              </Col>
              <Col span={8}>
                <img src="/logo.png" alt=""/>
              </Col>
            </Row>
            <Row className="module">
              <Row className="title">
                <Link to="/maintenance" style={{position:'relative'}}>
                  <Icon type="tool" theme="filled" />
                  <div>Mantenimiento</div>
                </Link>
              </Row>
              <Row type="flex" gutter={[12,0]}>
                <Col xs={24} md={16} lg={18} className="submodule">
                  <div className="content">
                    <Card title="Notificaciones" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', padding: '2px 6px'}}>
                      { molinos === null ?
                        <Spin/>
                        :
                        <ul>
                        { molinos.map((molino, index) => index < 2 &&
                          <li style={{marginBottom: 5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', listStylePosition:'inside'}}>
                            La Faena de <strong>{molino.faena.client.name}</strong> con OT <strong>{molino.ordenTrabajo}</strong> con fecha de inicio {moment(molino.startDate).format('DD/MM/YYYY')} se encuentra en curso, con un avance del <strong>{Math.round(molino.percentage*100)}%</strong>.
                          </li>  
                        )}
                        </ul>
                      }
                    </Card>
                  </div>
                </Col>
                <Col xs={24} md={8} lg={6} className="submodule">
                  <div className="content">
                    <Card title="Acciones rápidas" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', padding: '2px 6px'}}>
                      <Row style={{paddingBottom:5, fontSize:'1.1em'}}>
                        <Link to="/maintenance/new">
                          Ingrese nueva faena
                        </Link>
                      </Row>
                      <Row style={{fontSize:'1.1em'}}>
                        <Link to="/maintenance/STARTED">
                          Faenas en curso
                        </Link>
                      </Row>
                    </Card>
                  </div>
                </Col>
              </Row>
            </Row>
            <Row className="module">
              <Row className="title">
                <Link style={{position:'relative'}}>
                  <Icon type="user" />
                  <div>RRHH</div>
                </Link>
              </Row>
              <Row type="flex" gutter={[12,0]}>
                <Col xs={24} md={16} lg={18} className="submodule">
                  <div className="content">
                    <Card title="Notificaciones" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', padding: '2px 6px'}}>
                      
                    </Card>
                  </div>
                </Col>
                <Col xs={24} md={8} lg={6} className="submodule">
                  <div className="content">
                    <Card title="Acciones rápidas" bordered={false} headStyle={{color:'rgba(0,0,0,.55)', padding: '2px 6px'}}>
                      
                    </Card>
                  </div>
                </Col>
              </Row>
            </Row>
          </PageContent>
        </Page>
      </div>
    )
  }
}

export default withTranslation()(withRouter(Home))
