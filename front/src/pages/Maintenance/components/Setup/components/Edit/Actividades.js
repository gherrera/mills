import './Personal.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col, Table } from 'antd'
import { getActivityByMolinoPromise } from '../../../../promises'
import moment from 'moment'

const Actividades = ({molino}) => {
    const [actividades, setActividades] = useState(null)
    const [ showAll, setShowAll ] = useState(false)

  useEffect(() => {
    getActivityByMolinoPromise(molino.id).then(r => {
      setActividades(r)
    })
  }, [])

  const toogleShowAll = () => {
    setShowAll(!showAll)
  }

  const columnActivity = [
    {
      title: '#',
      with: '5%',
      dataIndex: 'id'
    },
    {
      title: 'Fecha Real',
      dataIndex: 'creationDate',
      with: '15%',
      render: (creationDate) => moment(creationDate).format("DD/MM/YYYY HH:mm:ss")
    },
    {
      title: 'Fecha Log',
      dataIndex: 'dateLog',
      with: '15%',
      render: (dateLog) => moment(dateLog).format("DD/MM/YYYY HH:mm:ss")
    },
    {
      title: 'Usuario',
      dataIndex: 'user',
      with: '15%',
    },
    {
      title: 'Turno',
      dataIndex: 'turno',
      with: '10%',
      render: (turno) => {
        if(turno === 'DAY') return 'Día'
        else return 'Noche'
      }
    },
    {
      title: 'Operacion',
      dataIndex: 'operation',
      with: '15%',
    },
    {
      title: 'Params',
      dataIndex: 'params',
      with: '15%',
      render: (params) => {
        if(params === 'EXECUTION') return 'Ejecución'
        else if(params === 'BEGINNING') return 'Inicio'
        else if(params === 'FINISHED') return 'Término'
        else if(params === 'DELIVERY') return 'Entrega'
        else if(params === 'OPEN') return 'Inicio'
        else if(params === 'CLOSED') return 'Término'
        else return params
      }
    },
    {
      title: 'Modo',
      width: '10%',
      render: (record) => {
        return <span className={"modo-act-" + ((record.creationDate === record.dateLog) ? 'online' : 'offline')}>{ (record.creationDate === record.dateLog) ? 'Online' : 'Offline' }</span>
      }
    }
  ]

  return (
    <div className='actividades'>
        <Row className="title">
            <Col span={18}>Registro de Actividades</Col>
              <Col span={6} className="ver-mas" onClick={toogleShowAll}>
                  <a>{showAll? "Ver menos" : "Ver más"}</a>
              </Col>
        </Row>
        { showAll &&
          <Table dataSource={actividades} loading={actividades===null} columns={columnActivity} size='small' />
        }
    </div>
  )
}

export default Actividades;
