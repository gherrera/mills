import './Setup.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Button, Table, Row, Col, Spin, Steps, Modal, notification } from 'antd'
import { getMolinosPromise, saveMolinoPromise } from '../../promises'
import moment from "moment";
import { Step1, Step2, Step3, Step4 } from './components'
import { getUsersByClientPromise } from '../../../../promises'

const { confirm } = Modal;

const Setup = ({currentUser, action, history}) => {
  const [molinos, setMolinos] = useState([])
  const [isModalVisibleNew, setIsModalVisibleNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [client, setClient] = useState({})
  const [faena, setFaena] = useState({})
  const [piezas, setPiezas] = useState([])
  const [personal, setPersonal] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    if(action === 'new') setIsModalVisibleNew(true)
    getUsersByClientPromise().then(users => setUsuarios(users))
    loadMolinos()
  }, [])

  const loadMolinos = () => {
    setIsLoading(true)
    getMolinosPromise().then(m => {
        setMolinos(m)
        setIsLoading(false)
    })
  }

  const { t } = useTranslation()

  const tableColumns = [
    /*
    { 
        title: "Nro",
        dataIndex: "id"
    },
    */
    { 
        title: "Razón social",
        dataIndex: "faena",
        render: (faena, record) => {
            return faena.client.name
        }
    },
    { 
        title: "Tipo de Proyecto",
        dataIndex: "faena",
        render: (faena, record) => {
            return faena.name
        }
    },
    { 
        title: "Orden de trabajo",
        dataIndex: "ordenTrabajo"
    },
    { 
        title: "Tipo de Equipo",
        dataIndex: "type"
    },
    { 
      title: "Molino",
      dataIndex: "name"
    },
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
        render: (text) => {
          if(text === 'FINISHED') return 'Finalizado'
          else if(text === 'STARTED') return 'Iniciado'
        }
    }
  ]

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
    let faenaObj = { name: faena.name, type: faena.type, ordenTrabajo: faena.ordenTrabajo, hours: faena.hours, faena: {id: faena.id, name: faena.faena, client} }

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
                    { currentStep === 2 && <Step3 pieces={piezas} nextStep={nextStep3} prevStep={prevStep3}/> }
                    { currentStep === 3 && <Step4 personal={personal} saveFaena={saveFaena} prevStep={prevStep4} usuarios={usuarios} /> }
                </Row>
            </Row>
        </Row>
        :
        <>
            <div className="tools-area">
                <Button id="create-faena" type="primary" icon="plus" onClick={nuevaFaena}>Nueva faena</Button>
            </div>
            <div className="table-wrapper">
            {
                isLoading ?
                <Spin spinning={ true } size="large" />
                :
                <Table columns={ tableColumns } dataSource={ molinos } size="small"/>
            }
            </div>
        </>
      }
    </div>
  )
}

export default withRouter(Setup)
