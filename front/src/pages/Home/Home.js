import './Home.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { Col, Row, Card } from 'antd'
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
              <Col span={3}>
                <Link to="/maintenance">
                  <div className="submodule name">
                      Mantenimiento
                  </div>
                </Link>
              </Col>
              <Col span={15} className="submodule">
                <div className="content">
                  <Card title="Notificaciones" bordered={false} size="small" headStyle={{color:'rgba(0,0,0,.55)', fontSize: 12, minHeight: 22, padding: '2px 6px'}}>

                  </Card>
                </div>
              </Col>
              <Col span={6} className="submodule">
                <div className="content">
                  <Card title="Acciones rápidas" bordered={false} size="small" headStyle={{color:'rgba(0,0,0,.55)', fontSize: 12, minHeight: 22, padding: '2px 6px'}}>
                    <Link to="/maintenance/new">
                      Ingrese nueva faena
                    </Link>
                  </Card>
                </div>
              </Col>
            </Row>
            <Row className="module">
              <Col span={3}>
                <div className="submodule name">
                    RRHH
                </div>
              </Col>
              <Col span={15} className="submodule">
                <div className="content">
                  <Card title="Notificaciones" bordered={false} size="small" headStyle={{color:'rgba(0,0,0,.55)', fontSize: 12, minHeight: 22, padding: '2px 6px'}}>

                  </Card>
                </div>
              </Col>
              <Col span={6} className="submodule">
                <div className="content">
                  <Card title="Acciones rápidas" bordered={false} size="small" headStyle={{color:'rgba(0,0,0,.55)', fontSize: 12, minHeight: 22, padding: '2px 6px'}}>

                  </Card>
                </div>
              </Col>
            </Row>
            {/*
            <Row gutter={[20,18]}>
              <Col span={10}>
                <Row gutter={26}>
                  <Col span={12}>
                      <Card>
                        <Statistic title="Formularios creados" value={stats.formsCreated} loading={loading} />
                      </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic title="Formularios recibidos" value={stats.formsReceived} loading={loading} />
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card className="cardLogo">
                      <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/Logo-e1627334345137.png"/>
                    </Card>
                  </Col>
                </Row>
              </Col>
              <Col span={14}>
                <Card title="Últimas 5 declaraciones recibidas" className="stats-forms">
                    { forms === null ? <Spin/>
                    :
                    <Table size="small" dataSource={forms} columns={this.columnsForms} pagination={false} />
                    }
                </Card>
              </Col>
            </Row>
            <Row gutter={26}>
              <Col span={24}>
                <Card title="Actividad en los últimos 30 días" className="stats-forms" loading={loading}>
                  {stats.formsGroupDay &&
                      <Column {...this.getConfigChart()} 
                      />
                  }
                </Card>
              </Col>
            </Row>
            <Row gutter={[26,42]}>
              <Col span={12}>
                <Card title="Formularios recibidos por Categoría" className="stats-forms" loading={loading}>
                    <Column {...this.getConfigChartStatsCategory()} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Estados asignados" className="stats-forms" loading={loading}>
                    <Column {...this.getConfigChartStatsCategoryStatus()} />
                </Card>
              </Col>
            </Row>
            */}
          </PageContent>
        </Page>
      </div>
    )
  }
}

export default withTranslation()(withRouter(Home))
