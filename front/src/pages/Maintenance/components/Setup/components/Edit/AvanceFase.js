import './AvanceFase.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col, Switch, Table, Modal, Button, Spin, Tabs, Descriptions, Tooltip, DatePicker } from 'antd'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons'
import { updatePartTaskPromise, updateTaskPromise } from '../../../../promises'

const { TabPane } = Tabs;
const { confirm } = Modal;

const AvanceFase = ({molino, stage}) => {
    const { t } = useTranslation()
    const [checked, setChecked] = useState(stage.stage !== 'DELIVERY')
    const [ recordSelected, setRecordSelected ] = useState(null)
    const [ isVisibleDetailsExecution, setIsVisibleDetailsExecution ] = useState(false)
    const [ detailsExecution, setDetailsExecution ] = useState(null)
    const [ interruptions, setInterruptions ] = useState(null)
    const [ recordPartTask, setRecordPartTask ] = useState(null)
    const [ recordTask, setRecordTask ] = useState(null)
    const [ tasks, setTasks ] = useState(stage.tasks)

  useEffect(() => {
    if(stage.stage === 'EXECUTION') {
      let details = []
      stage.tasks.map(t => {
        t.parts && t.parts.map(p => {
            p.task = t
            details.push(p)
        })
      })
      if(details.length) {
        setDetailsExecution(details)
      }
    }
  }, [stage])

  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (":") : "";
    var mDisplay = m > 0 ? m + (":") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return zeroPad(h,2)+":"+zeroPad(m,2); 
  }

  const onChangeSwitch = (chk) => {
    setChecked(chk)
  }

  const getIconTurno = (turno) => {
    if(turno === 'DAY') return <Tooltip title="Día"><FontAwesomeIcon icon={faSun} /></Tooltip>
    else return <Tooltip title="Noche"><FontAwesomeIcon icon={faMoon} /></Tooltip>
  }

  const editTask = (task) => {
    setRecordTask(task)
  }

  const getColumnsStage = () => {
    let columns = [
      {
        title: 'Proceso',
        dataIndex: 'task',
        width: '20px',
        render: (text) => t('messages.mills.task.'+text)
      },
    ]
    if(stage.stage === 'EXECUTION') {
      columns.push(
        {
          title: 'Piezas',
          dataIndex: 'parts',
          width: '10%',
          render: (parts, record) => 
            parts ?
              record.task !== 'GIRO' && 
              <a onClick={() => {
                setRecordSelected(record)
              }}>{parts.length}</a>
            :
            <Spin size="small" />
        }
      )
    }
    columns.push(
      {
        title: 'Inicio',
        dataIndex: 'creationDate',
        width: stage.stage === 'EXECUTION' ? '15%' : '20%',
        render: (text) => moment(text).format("DD/MM/YYYY HH:mm")
      },
      {
        title: 'Fin',
        dataIndex: 'finishDate',
        width: stage.stage === 'EXECUTION' ? '15%' : '20%',
        render: (text) => text ? moment(text).format("DD/MM/YYYY HH:mm") : 'N/A'
      },
      {
        title: 'Total',
        dataIndex: 'duration',
        width: '20%',
        render: (text) => secondsToHms(text)
      },
      {
        title: 'Turno',
        dataIndex: 'turnoStart',
        width: '10%',
        render: (text, record) => {
          let turno = record.turnoStart.turno
          if(record.turnoFinish) turno = record.turnoFinish.turno
          return getIconTurno(turno.name)
        }
      },
      {
        title: 'Acciones',
        width: '10%',
        render: (text, record, index) => {
          return <div>
            <Tooltip title="Modificar Fecha/Hora">
                <Button icon="edit" size="small" onClick={() => editTask(record)}/>
            </Tooltip>
          </div>
        }
      }
    )
    return columns
  }

  const columnsParts = [
    {
      title: 'Sección',
      dataIndex: 'type',
      with: '25%'
    },
    {
      title: 'Pieza',
      dataIndex: 'name',
      with: '55%'
    },
    {
      title: 'Cantidad',
      dataIndex: 'qty',
      with: '20%'
    }
  ]

  const editPartTask = (task) => {
    setRecordPartTask(task)
  }

  const onCancelModalRecordTask = () => {
    setRecordTask(null)
  }

  const onCancelModalRecordPartTask = () => {
    setRecordPartTask(null)
  }

  const getColumnsPartsDetail = (task) => {
    let columns = [
      {
        title: 'Nro',
        with: '5%',
        render: (text, record, index) => index+1
      },
      {
        title: 'Fecha',
        dataIndex: 'creationDate',
        with: '15%',
        render: (fec, record) => {
          return <Button type="link" onClick={() => editPartTask(record)}>{ moment(fec).format("DD/MM/YYYY HH:mm") }</Button>
        }
      },
      {
        title: 'Turno',
        dataIndex: 'turno',
        with: '10%',
        render: (turno) => getIconTurno(turno.turno.name)
      }
    ]
    if(!task) {
      columns.push(
        {
          title: 'Tarea',
          dataIndex: 'task',
          with: '15%',
          render: (task) => t('messages.mills.task.'+task.task)
        }
      )
    }
    columns.push(
      {
        title: 'Sección',
        dataIndex: 'part',
        with: task ? '25%' : '20%',
        render: (part) => part.type
      },
      {
        title: 'Pieza',
        dataIndex: 'part',
        with: task ? '45%' : '35%',
        render: (part) => part.name
      }
    )

    return columns
  }

  const onCancelModal = () => {
    setRecordSelected(null)
  }

  const openDetailsExecution = () => {
    setIsVisibleDetailsExecution(true)
  }

  const onCancelModalDetails = () => {
    setIsVisibleDetailsExecution(false)
  }

  const openInterruptions = (int) => {
    setInterruptions(int)
  }

  const onCancelModalInterruptions = () => {
    setInterruptions(null)
  }

  const interruptionsColumns = [
    {
      title: 'Tipo',
      dataIndex: 'type',
      width: '15%',
      render: (type) => {
          if(type === 'INTERRUPTION') return 'Interrupción'
          else if(type === 'COMMENT') return 'Comentario'
        }
    },
    {
      title: 'Fecha Inicio',
      dataIndex: 'startDate',
      width: '15%',
      render: (startDate) => moment(startDate).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Fecha Término',
      dataIndex: 'finishDate',
      width: '15%',
      render: (finishDate) => finishDate && moment(finishDate).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Observaciones',
      dataIndex: 'comments',
      width: '55%',
      render: (text) => <pre>{text}</pre>
    }
  ]

  const changeDateTimeTask = (attr, d) => {
    setRecordTask({ ...recordTask, save: true, [attr]: d.getTime()})
  }

  const changeDateTimePartTask = (d) => {
    setRecordPartTask({ ...recordPartTask, save: true, creationDate: new Date(d).getTime()})
  }

  const saveTask = () => {
    confirm({
      title: 'Está seguro de modificar la Fecha/Hora de la Tarea?',
      onOk() {
        updateTaskPromise({ id: recordTask.id, creationDate: recordTask.creationDate, finishDate: recordTask.finishDate}).then(t => {
          setRecordTask({ ...recordTask, creationDate: t.finishDate, save: null, duration: t.duration })

          let _tasks = [...tasks]
          _tasks.map(ta => {
            if(ta.id === t.id) {
              ta.creationDate = t.creationDate
              ta.finishDate = t.finishDate
              ta.duration = t.duration
            }
          })
          setTasks(_tasks)
        })
      }
    });
  }

  const savePartTask = () => {
    confirm({
      title: 'Está seguro de modificar la Fecha/Hora de la Tarea?',
      onOk() {
        updatePartTaskPromise({ id: recordPartTask.id, creationDate: recordPartTask.creationDate}).then(t => {
          setRecordPartTask({ ...recordPartTask, creationDate: t.creationDate, save: null })

          let _detailsExecution = [...detailsExecution]
          _detailsExecution.map(d => {
            if(d.id === t.id) {
              d.creationDate = t.creationDate
            }
          })
          setDetailsExecution(_detailsExecution)
        })
      }
    });
  }

  return (
    <div className="stage">
        <Row className="title-stage">
          <Col span={3}>
            Fase {t('messages.mills.stage.'+stage.stage)}
          </Col>
          { stage.stage === 'DELIVERY' ?
            <Col span={21} className="data-title" style={{paddingRight:'777px'}}>
              <label>Fecha</label>
              <span className="info datetime">{moment(stage.creationDate).format("DD/MM/YYYY HH:mm")}</span>
            </Col>
            :
            <Col span={21} className="data-title">
              <label>Inicio</label>
              <span className="info datetime">{moment(stage.creationDate).format("DD/MM/YYYY HH:mm")}</span>

              <label>Fin</label>
              <span className="info datetime">{stage.finishDate ? moment(stage.finishDate).format("DD/MM/YYYY HH:mm") : 'N/A'}</span>

              <label>Duración total</label>
              <span className="info duration">{secondsToHms(stage.realDuration)}</span>

              <label>Duración real</label>
              <span className="info duration">{secondsToHms(stage.duration)}</span>

              <label>Interrupciones</label>
              <span className="info interruption">
                {stage.events.length === 0 ? 0
                :
                  <a onClick={() => openInterruptions(stage.events)}>{stage.events.length}</a>
                }
              </span>

              { stage.stage !== 'DELIVERY' &&
                <Switch size="small" defaultChecked={checked} onChange={onChangeSwitch}/>
              }
            </Col>
          }
        </Row>
        { stage.stage === 'EXECUTION' &&
          <Row className="indicators-ex" gutter={[12,18]}>
            <Col span={8}>
              <div className="indicator">
                <div className="content-indicator">
                  Piezas botadas: {molino.totalBotadas}
                </div>
              </div>
            </Col>
            <Col span={7}>
              <div className="indicator">
                <div className="content-indicator">
                  Piezas montadas: {molino.totalMontadas}
                </div>
              </div>
            </Col>
            <Col span={7}>
              <div className="indicator">
                <div className="content-indicator">
                  Giros: {molino.giros}
                </div>
              </div>
            </Col>
            <Col span={2}>
              <Button size="small" icon="database" style={{float:'right'}} disabled={detailsExecution === null} onClick={openDetailsExecution}>Detalle</Button>
            </Col>
          </Row>
        }
        { checked &&
          <Row className="data-table">
            <Table dataSource={tasks} columns={getColumnsStage()} size="small" pagination={false} rowClassName={(record, index) => 'row-task-'+record.task} />
          </Row>
        }

        { recordSelected &&
          <Modal
            title="Detalle de piezas"
            visible={true}
            width={800}
            onCancel={onCancelModal}
            style={{ top: 20 }}
            footer={ [
              <Button onClick={onCancelModal}>
                Cerrar
              </Button>
            ]}
          >
            <Tabs defaultActiveKey="1" >
              <TabPane tab="Resumen" key="1">
                <Table dataSource={recordSelected.partsByType} columns={columnsParts} size="small" pagination={false}/>
              </TabPane>
              <TabPane tab="Detalle" key="2">
                <Table dataSource={recordSelected.parts} columns={getColumnsPartsDetail(recordSelected)} size="small" pagination={false}/>
              </TabPane>
            </Tabs>

          </Modal>
        }
        {isVisibleDetailsExecution && 
          <Modal
            title="Detalle de piezas"
            visible={true}
            width={800}
            onCancel={onCancelModalDetails}
            style={{ top: 10 }}
            footer={ [
              <Button onClick={onCancelModalDetails}>
                Cerrar
              </Button>
            ]}
          >
            <Table dataSource={detailsExecution} columns={getColumnsPartsDetail()} size="small" pagination={false}/>
          </Modal>
        }
        { interruptions &&
          <Modal
            title="Eventos"
            visible={true}
            width={900}
            wrapClassName="modalInterruptions"
            onCancel={onCancelModalInterruptions}
            footer={ [
              <Button onClick={onCancelModalInterruptions}>
                Cerrar
              </Button>
            ]}
          >
            <Table dataSource={interruptions} columns={interruptionsColumns} size="small" pagination={false}/>
          </Modal>
        }
        { recordTask &&
          <Modal
            title="Modificar Fechas Tarea"
            visible={true}
            width={800}
            onCancel={onCancelModalRecordTask}
            footer={ [
              <Button disabled={!recordTask.save} onClick={saveTask}>
                Guardar
              </Button>,
              <Button onClick={onCancelModalRecordTask}>
                Cerrar
              </Button>
            ]}
          >
              <Descriptions bordered size="small" layout="vertical">
                <Descriptions.Item label="Tarea">{ t('messages.mills.task.'+recordTask.task) }</Descriptions.Item>
                <Descriptions.Item label="Turno">{ getIconTurno(recordTask.turnoFinish ? recordTask.turnoFinish.turno.name : recordTask.turnoStart.turno.name) }</Descriptions.Item>
                <Descriptions.Item label="Duración">{ secondsToHms(recordTask.duration) }</Descriptions.Item>
                <Descriptions.Item label="Inicio">
                  <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" 
                    allowClear={false} showToday={false}
                    defaultValue={moment(recordTask.creationDate)}
                    onOk={(d) => changeDateTimeTask('creationDate', new Date(d))} />
                </Descriptions.Item>
                <Descriptions.Item label="Termino">
                  { recordTask.finishDate &&
                    <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" 
                      allowClear={false} showToday={false}
                      defaultValue={moment(recordTask.finishDate)}
                      onOk={(d) => changeDateTimeTask('finishDate', new Date(d))} />
                  }
                </Descriptions.Item>
              </Descriptions>
          </Modal>
        }
        { recordPartTask &&
          <Modal
            title="Modificar Fecha Movimiento"
            visible={true}
            width={800}
            onCancel={onCancelModalRecordPartTask}
            footer={ [
              <Button disabled={!recordPartTask.save} onClick={savePartTask}>
                Guardar
              </Button>,
              <Button onClick={onCancelModalRecordPartTask}>
                Cerrar
              </Button>
            ]}
          >
            <Descriptions bordered size="small" layout="vertical">
              <Descriptions.Item label="Turno">{ getIconTurno(recordPartTask.turno.turno.name) }</Descriptions.Item>
              <Descriptions.Item label="Usuario">{ recordPartTask.user }</Descriptions.Item>
              <Descriptions.Item label="Tarea">{ t('messages.mills.task.'+recordPartTask.task.task) }</Descriptions.Item>
              <Descriptions.Item label="Sección">{ recordPartTask.part.type }</Descriptions.Item>
              <Descriptions.Item label="Pieza">{ recordPartTask.part.name }</Descriptions.Item>
              <Descriptions.Item label="Fecha/Hora">
                <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" 
                  allowClear={false} showToday={false}
                  defaultValue={moment(recordPartTask.creationDate)}
                  onOk={changeDateTimePartTask} />
              </Descriptions.Item>
            </Descriptions>
          </Modal>
        }
    </div>
  )
}

export default AvanceFase;
