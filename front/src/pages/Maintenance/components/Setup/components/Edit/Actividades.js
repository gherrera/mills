import './Personal.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col, Table, Button, Modal } from 'antd'
import { getActivityByMolinoPromise, deleteActivityPromise } from '../../../../promises'
import moment from 'moment'

const { confirm } = Modal;

const Actividades = ({molino}) => {
  const [actividades, setActividades] = useState(null)
  const [firstElement, setFirstElement] = useState(null)
  const [isModalVisibleDelete, setIsModalVisibleDelete] = useState(false)
  const [ showAll, setShowAll ] = useState(false)

  useEffect(() => {
    init();
  }, [])

  const init = () => {
    getActivityByMolinoPromise(molino.id).then(r => {
      setActividades(r)
      if(r.length > 0) {
        setFirstElement(r[0])
      }
    })
  }

  const toogleShowAll = () => {
    setShowAll(!showAll)
  }

  const deleteActivity = (record) => {
    confirm({
      title: 'Eliminar Actividad',
      content: 'Está seguro de borrar la actividad?',
      onOk() {
        deleteActivityPromise(molino.id, record.id).then(r => {
          setActividades(null);
          init();
        })
      }
    });
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
      with: '12%',
      render: (creationDate) => moment(creationDate).format("DD/MM/YYYY HH:mm:ss")
    },
    {
      title: 'Fecha Log',
      dataIndex: 'dateLog',
      with: '12%',
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
      render: (operacion, record) => {
        if(operacion === 'agregaParte' && record.entity === 'BOTADO') {
          return 'Bota Pieza'
        }else if(operacion === 'agregaParte' && record.entity === 'LIMPIEZA') {
          return 'Limpia Pieza'
        }else if(operacion === 'agregaParte' && record.entity === 'MONTAJE') {
          return 'Montaje Pieza'
        }else {
          return operacion
        }
      }
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
    },
    {
      title: 'Eliminar',
      width: '6%',
      dataIndex: 'id',
      render: (id, record, index) => index === 0 && firstElement.id === id && <Button icon='delete' size="small" onClick={() => deleteActivity(record)} />
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
