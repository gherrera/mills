import './Setup.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Button, Table, Row, Col, Spin, Steps, Modal, notification, Icon, Badge, Upload } from 'antd'
import { getMolinosPromise, saveMolinoPromise, uploadConfigTiposEquipoPromise, uploadConfigTiposPiezaPromise, uploadConfigPersonalPromise } from '../../promises'
import moment from "moment";
import { Step1, Step2, Step3, Step4, Edit } from './components'
import { getUsersByClientPromise } from '../../../../promises'
import { ReportService } from '../../../../services'

const { confirm } = Modal;

const Setup = ({currentUser, action, history}) => {
  const [molinos, setMolinos] = useState([])
  const [isModalVisibleNew, setIsModalVisibleNew] = useState(false)
  const [isModalVisibleConfig, setIsModalVisibleConfig] = useState(false)
  const [isModalVisibleEdit, setIsModalVisibleEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [client, setClient] = useState({})
  const [faena, setFaena] = useState({})
  const [piezas, setPiezas] = useState([])
  const [personal, setPersonal] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [usuarios, setUsuarios] = useState([])
  const [fileList, setFileList] = useState([])
  const [faenaSel, setFaenaSel] = useState(null)

  useEffect(() => {
    if(action === 'new') setIsModalVisibleNew(true)
    getUsersByClientPromise().then(users => setUsuarios(users))
    loadMolinos()
  }, [])

  const loadMolinos = () => {
    setIsLoading(true)
    getMolinosPromise(action === 'new' || action === 'setup' ? null : action).then(m => {
        setMolinos(m)
        setIsLoading(false)
    })
  }

  const { t } = useTranslation()

  const getStatus = (status) => {
    if(status === 'FINISHED') return 'Finalizado'
    else if(status === 'STARTED') return 'Iniciado'
    else if(!status) return 'Pendiente'
  }

  const getStageDesc = (stage) => {
    if(stage === 'BEGINNING') return 'Inicio'
    else if(stage === 'EXECUTION') return 'Ejecución'
    else if(stage === 'FINISHED') return 'Término'
    else if(stage === 'DELIVERY') return 'Entrega'
  }

  const onClickFaena = (f) => {
    setFaenaSel(f)
    setIsModalVisibleEdit(true)
  }

  const getTableColumns = () => {
    let columns = [
      { 
          title: "Nro",
          dataIndex: "nro",
          sorter: (a, b) => {
            if(a.nro < b.nro) return -1
            else if(a.nro > b.nro) return 1
            else return 0
          },
      },
      { 
          title: "Razón social",
          dataIndex: "faena",
          sorter: (a, b) => {
            if(a.faena.client.name < b.faena.client.name) return -1
            else if(a.faena.client.name > b.faena.client.name) return 1
            else return 0
          },
          render: (faena, record) => {
              return <a onClick={() => onClickFaena(record)}>{faena.client.name}</a>
          }
      },
      { 
          title: "Tipo de Proyecto",
          dataIndex: "faena",
          sorter: (a, b) => {
            if(a.faena.name < b.faena.name) return -1
            else if(a.faena.name > b.faena.name) return 1
            else return 0
          },
          render: (faena, record) => {
              return faena.name
          }
      },
      { 
          title: "Orden de trabajo",
          dataIndex: "ordenTrabajo",
          sorter: (a, b) => {
            if(a.ordenTrabajo < b.ordenTrabajo) return -1
            else if(a.ordenTrabajo > b.ordenTrabajo) return 1
            else return 0
          },
      },
      { 
          title: "Tipo de Equipo",
          dataIndex: "type",
          sorter: (a, b) => {
            if(a.type < b.type) return -1
            else if(a.type > b.type) return 1
            else return 0
          },
      },
      { 
        title: "Molino",
        dataIndex: "name",
        sorter: (a, b) => {
          if(a.name < b.name) return -1
          else if(a.name > b.name) return 1
          else return 0
        },
      }
    ]
    if(action === 'setup' || action === 'new') {
      columns.push(
        { 
          title: "Actualización",
          dataIndex: "updateDate",
          render: (date) => {
              if(date) return moment(date).format("DD/MM/YYYY HH:mm")
          }
        },
        { 
            title: "Estado",
            dataIndex: "status",
            sorter: (a, b) => {
              const statusA = getStatus(a.status)
              const statusB = getStatus(b.status)
              if(statusA < statusB) return -1
              else if(statusA > statusB) return 1
              else return 0
            },
            render: (text) => getStatus(text)
        }
      )
    }else if(action === 'STARTED' || action === 'PENDING' || action === 'FINISHED') {
      columns.push(
        { 
            title: "Planificación",
            dataIndex: "hours",
            sorter: (a, b) => {
              if(a.hours < b.hours) return -1
              else if(a.hours > b.hours) return 1
              else return 0
            },
            render: (text) => {
              return text + ' horas'
            }
        }
      )

      if(action === 'STARTED') {
        columns.push(
          { 
            title: "Inicio",
            dataIndex: "startDate",
            render: (date) => {
                if(date) return moment(date).format("DD/MM/YYYY HH:mm")
            }
          },
          { 
            title: "Avance",
            dataIndex: "percentage",
            render: (text) => {
                return text*100 + '%'
            }
          },
          { 
            title: "Fase en curso",
            dataIndex: "currentStage",
            render: (stage) => {
                return getStageDesc(stage.stage)
            }
          }
        )
      }else if(action === 'FINISHED') {
        columns.push(
          { 
            title: "Inicio",
            dataIndex: "startDate",
            render: (date) => {
                if(date) return moment(date).format("DD/MM/YYYY HH:mm")
            }
          },
          { 
            title: "Finalización",
            dataIndex: "updateDate",
            render: (date) => {
                if(date) return moment(date).format("DD/MM/YYYY HH:mm")
            }
          }
        )
      }
    }
    return columns
  }

  const nextStep1 = (cliente) => {
    setClient(cliente)
    setCurrentStep(1)
  }

  const nextStep2 = (f) => {
    setFaena(f)
    setCurrentStep(2)
  }

  const prevStep2 = (f) => {
    setFaena(f)
    setCurrentStep(0)
  }

  const nextStep3 = (p) => {
    setPiezas(p)
    setCurrentStep(3)
  }

  const prevStep3 = (p) => {
    setPiezas(p)
    setCurrentStep(1)
  }

  const prevStep4 = (p) => {
    setPersonal(p)
    setCurrentStep(2)
  }

  const saveFaena = (p) => {
    setPersonal(p)
    let faenaObj = { name: faena.name, type: faena.type, ordenTrabajo: faena.ordenTrabajo, hours: faena.hours, exHours: faena.exHours, faena: {id: faena.id, name: faena.faena, client} }

    faenaObj.parts = piezas
    let uniqTurnos = [...new Set(p.map(item => item.turno))];
    let turns = []
    uniqTurnos.map(t => {
      let turno = {name: t}
      turno.personas = p.filter(p => p.turno === t)
      turns.push(turno)
    })
    faenaObj.turns = turns

    confirm({
      title: 'Grabar Faena',
      content: 'Confirma el grabado de nueva Faena?',
      onOk() {
        saveMolinoPromise(faenaObj).then(m => {
          if(m) {
            loadMolinos()
            notification.success({
              message: 'Nuevo Molino',
              description: 'Molino guardado exitosamente'
            })
            setIsModalVisibleNew(false)
            if(action === 'new') history.push('/maintenance/setup')
          }else {
            notification.error({
              message: 'Error',
              description: 'Ocurrió un error al grabar molino'
            })
          }
        })

      },
      onCancel() {},
    });

  }

  const nuevaFaena = () => {
    setCurrentStep(0)
    setIsModalVisibleNew(true)
  }

  const openSettings = () => {
    setIsModalVisibleConfig(true)
  }

  const onCancelModalConfig = () => {
    setIsModalVisibleConfig(false)
  }

  const donwloadTipoEquipo = () => {
    ReportService.read('/reportTiposEquipo', null, null, 'tipoEquipos.xlsx')
  }

  const donwloadTipoPieza = () => {
    ReportService.read('/reportTiposPieza', null, null, 'tipoPiezas.xlsx')
  }

  const donwloadPersonal = () => {
    ReportService.read('/reportPersonal', null, null, 'personal.xlsx')
  }

  const getPropsUpload = (type) => {
    return {
      accept: ".xlsx",
      onRemove: file => {
        
      },
      beforeUpload: async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        let resp
        if(type === 'tiposEquipo') resp = await uploadConfigTiposEquipoPromise(formData)
        else if(type === 'tiposPieza') resp = await uploadConfigTiposPiezaPromise(formData)
        else if(type === 'personal') resp = await uploadConfigPersonalPromise(formData)

        if(resp === 'OK') {
          notification.success({
            message: 'Configuración',
            description: 'Datos guardados exitosamente'
          })
        }else {
          notification.error({
            message: 'Error',
            description: 'Ocurrió un error al grabar los datos'
          })
        }
        return false
      },
      multiple: false,
      fileList
    }
  }

  return (
    <div className='setup'>
      {isModalVisibleNew ? 
        <Row className="new-faena">
            <div className="tools-area">
                <Col style={{float:'left', marginLeft: 20}}>Ingreso de una nueva Faena</Col>
                <Button icon="close" onClick={() => setIsModalVisibleNew(false)} size="small"/>
            </div>
            <Row className="body-new-faena">
                <Steps current={currentStep} style={{padding:10}} >
                    <Steps.Step title="Cliente" />
                    <Steps.Step title="Faena" />
                    <Steps.Step title="Piezas" />
                    <Steps.Step title="Personal" />
                </Steps>
                <Row style={{padding:10, backgroundColor: 'rgba(0,0,0,.02)'}}>
                    { currentStep === 0 && <Step1 client={client} nextStep={nextStep1} molinos={molinos} /> }
                    { currentStep === 1 && <Step2 client={client} faena={faena} nextStep={nextStep2} prevStep={prevStep2} molinos={molinos} /> }
                    { currentStep === 2 && <Step3 pieces={piezas} nextStep={nextStep3} prevStep={prevStep3} mode="new" /> }
                    { currentStep === 3 && <Step4 personal={personal} saveFaena={saveFaena} prevStep={prevStep4} usuarios={usuarios} mode="new" /> }
                </Row>
            </Row>
        </Row>
      : isModalVisibleEdit ?
          <Row className="edit-faena">
            <div className="tools-area">
                <span className="title">Faena Nro. {faenaSel.nro}</span>
                <span className="createAt">Creada en Fecha: {moment(faenaSel.creationDate).format('DD/MM/YYYY')}</span>
                <Button icon="close" onClick={() => setIsModalVisibleEdit(false)} size="small"/>
            </div>
            <Edit molino={faenaSel} action={action} loadMolinos={loadMolinos} />
          </Row>
      :
        <>
            { (action === 'new' || action === 'setup') &&
              <div className="tools-area">
                  <Button type="primary" icon="setting" onClick={openSettings}>Configuración</Button>
                  <Button type="primary" icon="plus" onClick={nuevaFaena}>Nueva faena</Button>
              </div>
            }
            <div className="table-wrapper">
            {
                isLoading ?
                <Spin spinning={ true } size="large" />
                :
                <Table columns={ getTableColumns() } dataSource={ molinos } size="small"/>
            }
            </div>

            { isModalVisibleConfig &&
              <Modal
                wrapClassName="modal-config"
                title="Configuración"
                visible={true}
                width={750}
                onCancel={onCancelModalConfig}
                footer={ [
                  <Button onClick={onCancelModalConfig}>
                    Cerrar
                  </Button>
                ]}
              >
                <Row gutter={[0,12]} type="flex">
                  <Col span={6}>
                    <div className="content-config" style={{fontWeight:'bold'}}>
                      Tipo de Equipo
                    </div>
                  </Col>
                  <Col span={10}>
                    <div className="content-config">
                      <Col span={7}>
                        <Badge
                          count={1}
                          style={{ backgroundColor: '#fff', color: '#999', boxShadow: 'rgba(0,0,0,.7) 0px 0px 0px 1px inset' }}
                        />
                        <Badge count={<Icon type="arrow-down" style={{ backgroundColor: 'rgba(0,128,0,.8)', color:'white', bottom:-10, right:6, top:'unset', borderRadius: 5}} />}>
                          <a onClick={donwloadTipoEquipo}>
                            <Icon type="file-excel" style={{ fontSize: '250%', marginLeft: 10, color:'rgba(0,128,0,.8)'}} />
                          </a>
                        </Badge>
                      </Col>
                      <Col span={17} style={{paddingLeft:15}}>
                        Descargue la plantilla de tipos de equipos contenida en el sistema
                      </Col>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="content-config">
                      <Col span={8}>
                        <Badge
                          count={2}
                          style={{ backgroundColor: '#fff', color: '#999', boxShadow: 'rgba(0,0,0,.7) 0px 0px 0px 1px inset' }}
                        />
                        <Upload {...getPropsUpload('tiposEquipo')}>
                          <a>
                            <Icon type="upload" style={{ fontSize: '250%', marginLeft: 10, fontWeight:'bold', color:'rgba(0,0,0,.8)'}} />
                          </a>
                        </Upload>
                      </Col>
                      <Col span={16} style={{paddingLeft:15}}>
                        Cargue la nueva plantilla
                      </Col>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[0,12]} type="flex">
                  <Col span={6}>
                    <div className="content-config" style={{fontWeight:'bold'}}>
                      Tipo de piezas
                    </div>
                  </Col>
                  <Col span={10}>
                    <div className="content-config">
                      <Col span={7}>
                        <Badge
                          count={1}
                          style={{ backgroundColor: '#fff', color: '#999', boxShadow: 'rgba(0,0,0,.7) 0px 0px 0px 1px inset' }}
                        />
                        <Badge count={<Icon type="arrow-down" style={{ backgroundColor: 'rgba(0,128,0,.8)', color:'white', bottom:-10, right:6, top:'unset', borderRadius: 5}} />}>
                          <a onClick={donwloadTipoPieza}>
                            <Icon type="file-excel" style={{ fontSize: '250%', marginLeft: 10, color:'rgba(0,128,0,.8)'}} />
                          </a>
                        </Badge>
                      </Col>
                      <Col span={17} style={{paddingLeft:15}}>
                        Descargue la plantilla de tipos de equipos contenida en el sistema
                      </Col>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="content-config">
                      <Col span={8}>
                        <Badge
                          count={2}
                          style={{ backgroundColor: '#fff', color: '#999', boxShadow: 'rgba(0,0,0,.7) 0px 0px 0px 1px inset' }}
                        />
                        <Upload {...getPropsUpload('tiposPieza')}>
                          <a>
                            <Icon type="upload" style={{ fontSize: '250%', marginLeft: 10, fontWeight:'bold', color:'rgba(0,0,0,.8)'}} />
                          </a>
                        </Upload>
                      </Col>
                      <Col span={16} style={{paddingLeft:15}}>
                        Cargue la nueva plantilla
                      </Col>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[0,12]} type="flex">
                  <Col span={6}>
                    <div className="content-config" style={{fontWeight:'bold'}}>
                      Personal
                    </div>
                  </Col>
                  <Col span={10}>
                    <div className="content-config">
                      <Col span={7}>
                        <Badge
                          count={1}
                          style={{ backgroundColor: '#fff', color: '#999', boxShadow: 'rgba(0,0,0,.7) 0px 0px 0px 1px inset' }}
                        />
                        <Badge count={<Icon type="arrow-down" style={{ backgroundColor: 'rgba(0,128,0,.8)', color:'white', bottom:-10, right:6, top:'unset', borderRadius: 5}} />}>
                          <a onClick={donwloadPersonal}>
                            <Icon type="file-excel" style={{ fontSize: '250%', marginLeft: 10, color:'rgba(0,128,0,.8)'}} />
                          </a>
                        </Badge>
                      </Col>
                      <Col span={17} style={{paddingLeft:15}}>
                        Descargue la plantilla de tipos de equipos contenida en el sistema
                      </Col>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="content-config">
                      <Col span={8}>
                        <Badge
                          count={2}
                          style={{ backgroundColor: '#fff', color: '#999', boxShadow: 'rgba(0,0,0,.7) 0px 0px 0px 1px inset' }}
                        />
                        <Upload {...getPropsUpload('personal')}>
                          <a>
                            <Icon type="upload" style={{ fontSize: '250%', marginLeft: 10, fontWeight:'bold', color:'rgba(0,0,0,.8)'}} />
                          </a>
                        </Upload>
                      </Col>
                      <Col span={16} style={{paddingLeft:15}}>
                        Cargue la nueva plantilla
                      </Col>
                    </div>
                  </Col>
                </Row>

                <Row gutter={[0,24]}>
                  <Col>
                    <div style={{fontStyle:'italic', fontSize:'1.1em'}} className="content-config">
                      <Icon type="warning" />&nbsp;Los datos cargados reemplazarán a los existentes en el sistema
                    </div>
                  </Col>
                </Row>
              </Modal>
            }
        </>
      }
    </div>
  )
}

export default withRouter(Setup)
