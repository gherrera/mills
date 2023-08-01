import './Turnos.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col, Table, Button, Modal, Descriptions, notification, DatePicker } from 'antd'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { updateTurnoHistorialPromise } from '../../../../promises'

const { confirm } = Modal;

const Turnos = ({molino, updateTurnoHistorial}) => {
  const { t } = useTranslation()
  const [ showAll, setShowAll ] = useState(false)
  const [ turnoEdit, setTurnoEdit] = useState(null)

  useEffect(() => {
  }, [])

  const toogleShowAll = () => {
    setShowAll(!showAll)
  }
  
  const editTurno = (turno) => {
    setTurnoEdit(turno)
  }

  const onCancelModal = () => {
    setTurnoEdit(null)
  }

  const saveTurno = () => {
    confirm({
        title: 'Está seguro de modificar la Fecha/Hora del Turno?',
        onOk() {
            updateTurnoHistorialPromise(turnoEdit).then(turno => {
                onCancelModal()
    
                notification.success({
                    message: 'Turno',
                    description: 'Fechas actualizadas'
                })

                let turnos = [...molino.turnoHistorial]
                turnos.map(t => {
                    if(t.id === turno.id) {
                      t.creationDate = turno.creationDate
                      t.closedDate = turno.closedDate
                    }
                  })
                updateTurnoHistorial(turnos);
            })
        }
      });
  }

  const changeDateTimeTurno = (attr, d) => {
    setTurnoEdit({ ...turnoEdit, save: true, [attr]: d.getTime()})
  }

  const columnsTurnos = [
    {
        title: '#',
        render: (text, record, index) => {
            return index+1
        }
    }, {
        title: 'Turno',
        dataIndex: 'turno',
        render: (turno) => t('messages.mills.turno.' + turno?.name)
    }, {
        title: 'Controlador',
        dataIndex: 'turno',
        render: (turno) => turno?.personas?.find(p => p.role === 'CONTROLLER')?.name
    }, {
        title: 'Estado',
        dataIndex: 'turno',
        render: (turno) => t('messages.mills.status.' + turno?.status)
    }, {
        title: 'Fecha de Inicio',
        dataIndex: 'creationDate',
        render: (creationDate, record) => {
            return <Button type="link" onClick={() => editTurno(record)}>{ moment(creationDate).format("DD/MM/YYYY HH:mm") }</Button>
        }
    }, {
        title: 'Fecha de Término',
        dataIndex: 'closedDate',
        render: (closedDate, record) => {
            return closedDate && <Button type="link" onClick={() => editTurno(record)}>{ moment(closedDate).format("DD/MM/YYYY HH:mm") }</Button>
        }
    }
  ]

  return (
    <div className='turnos'>
        <Row className="title">
            <Col span={18}>Turnos</Col>
            <Col span={6} className="ver-mas" onClick={toogleShowAll}>
                <a>{showAll? "Ver menos" : "Ver más"}</a>
            </Col>
        </Row>
        { showAll &&
            <Table dataSource={molino.turnoHistorial} columns={columnsTurnos} size='small' />
        }
        { turnoEdit &&
            <Modal
                title="Detalle de Turno"
                visible={true}
                width={800}
                onCancel={onCancelModal}
                footer={ [
                    <Button disabled={!turnoEdit.save} onClick={saveTurno}>
                      Guardar
                    </Button>,
                    <Button onClick={onCancelModal}>
                      Cerrar
                    </Button>
                  ]}
            >
                <Descriptions bordered size="small" layout="vertical" column={2}>
                    <Descriptions.Item label="Turno">{ t('messages.mills.turno.' + turnoEdit.turno.name) }</Descriptions.Item>
                    <Descriptions.Item label="Controlador">{ turnoEdit.turno?.personas?.find(p => p.role === 'CONTROLLER')?.name }</Descriptions.Item>
                    <Descriptions.Item label="Inicio">
                        <DatePicker showTime={{format: 'HH:mm'}} format="DD-MM-YYYY HH:mm" 
                            allowClear={false} showToday={false}
                            defaultValue={moment(turnoEdit.creationDate)}
                            onOk={(d) => changeDateTimeTurno('creationDate', new Date(d))} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Termino">
                        <DatePicker showTime={{format: 'HH:mm'}} format="DD-MM-YYYY HH:mm" 
                            allowClear={false} showToday={false}
                            defaultValue={turnoEdit.closedDate && moment(turnoEdit.closedDate)}
                            onOk={(d) => changeDateTimeTurno('closedDate', new Date(d))} />
                    </Descriptions.Item>
                </Descriptions>
            </Modal>
        }
    </div>
  )
}

export default Turnos;