import './Home.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Col, Row, Spin, Card, Statistic, Table, Tooltip, Select } from 'antd'
import { Page, PageContent } from '../../layouts/Private/components'
import moment from "moment";

class Home extends Component {
  state = {
    stats: {},
    loading: true,
    forms: null,
    formsCategory: [],
    formsStatus: []
  }

  getEstado(estado) {
    if(estado === 'RECIBIDO') return 'Recibido'
    else if(estado === 'PENDIENTE') return 'Pendiente'
    else if(estado === 'EVALUACION') return 'En Evaluación'
    else if(estado === 'CERRADO') return 'Cerrado'
  }

  getCategoria(cat) {
    if(cat === 'CLIENTE') return 'Cliente'
    else if(cat === 'COLABORADOR') return 'Colaborador'
    else if(cat === 'PROVEEDOR') return 'Proveedor'
    else if(cat === 'DIRECTOR') return 'Director'
  }

  async componentDidMount() {
    const { currentUser } = this.props
    /*
    statsPromise().then(r => {
      this.setState({
        stats: r,
        loading: false
      })
    })
    getFormByClienteIdPromise(0, 5, {}).then(response => {
      this.setState({
        forms: response.records
      })
    })
    statsCategoryPromise().then(r => {
      let list = []
      r.map(rec => {
        list.push({
          categoria: this.getCategoria(rec.categoria),
          cant: rec.cant
        })
      })
      this.setState({
        formsCategory: list
      })
    })
    statsCategoryStatusPromise().then(r => {
      let list = []
      r.map(rec => {
        list.push({
          estado: this.getEstado(rec.estado),
          categoria: this.getCategoria(rec.categoria),
          cant: rec.cant
        })
      })
      this.setState({
        formsStatus: list
      })
    })
    */
  }

  columnsForms = [
      {
          title: 'Formulario',
          dataIndex: 'name',
          width: '50%',
          render: (text, record) => <Tooltip title={text}>{text}</Tooltip>
      },
      {
        title: 'Destinatario',
        dataIndex: 'name',
        width: '20%',
        render: (text, record) => record.dest.name
    },
    {
          title: 'Folio',
          dataIndex: 'folio',
          width: '15%'
      },
      {   
          title: 'Fecha Recepción',
          dataIndex: 'sendDate',
          width: '15%',
          render: (text, record) => moment(text).format('DD.MM.YYYY HH:mm')
      }
  ]

  getConfigChart() {
    return {
      data: this.state.stats.formsGroupDay,
      height: 140,
      xField: 'fecha',
      yField: 'cant',
      point: {
        size: 5,
        shape: 'diamond',
      },
      label: {
        style: {
          fill: '#aaa',
        },
      },
      meta: {
        fecha: { alias: 'Fecha' },
        cant: { alias: 'Formularios' }
      }
    }
  };

  getConfigChartStatsCategory() {
    return {
      data: this.state.formsCategory,
      height: 140,
      xField: 'categoria',
      yField: 'cant',
      point: {
        size: 5,
        shape: 'diamond',
      },
      label: {
        style: {
          fill: '#aaa',
        },
      },
      meta: {
        fecha: { alias: 'Categoría' },
        cant: { alias: 'Formularios' }
      }
    }
  };

  getConfigChartStatsCategoryStatus() {
    return {
      data: this.state.formsStatus,
      height: 140,
      isGroup: true,
      xField: 'estado',
      yField: 'cant',
      seriesField: 'categoria',
      point: {
        size: 5,
        shape: 'diamond',
      },
      label: {
        style: {
          fill: '#aaa',
        },
      },
      meta: {
        fecha: { estado: 'Estado' },
        cant: { alias: 'Formularios' }
      }
    }
  };

  handleChageCategory(value) {
    this.setState({
      category1: value
    })  
  }

  handleChageCategory2(value) {
    this.setState({
      category1: value
    })  
  }

  render() {
    const { t } = this.props
    const { stats, loading, forms } = this.state

    return (
      <div className="home">
        <Page>
          <PageContent>
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
                  {/* stats.formsGroupDay &&
                      <Column {...this.getConfigChart()} 
                      />
                  */}
                </Card>
              </Col>
            </Row>
            {/*
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
