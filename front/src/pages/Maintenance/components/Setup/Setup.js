import './Setup.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Table, Select, Row, Col, Spin, Steps } from 'antd'
import { getMolinosPromise } from '../../promises'
import moment from "moment";

const { Option } = Select

export default ({currentUser, action}) => {
  const [faenas, setFaenas] = useState([])
  const [isModalVisibleNew, setIsModalVisibleNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if(action === 'new') setIsModalVisibleNew(true)
     
    setIsLoading(true)
    getMolinosPromise().then(molinos => {
        setFaenas(molinos)
        setIsLoading(false)
    })
  }, [])

  const { t } = useTranslation()

  const tableColumns = [
    { 
        title: "Nro",
        dataIndex: "id"
    },
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
        dataIndex: "nro"
    },
    { 
        title: "Tipo de Equipo",
        dataIndex: "type"
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
        dataIndex: "status"
    }
  ]

  return (
    <div className='setup'>
      {isModalVisibleNew ? 
        <Row className="new-faena">
            <div className="tools-area">
                <Col style={{float:'left', marginLeft: 20}}>Ingreso de una nueva faena</Col>
                <Button icon="close" onClick={() => setIsModalVisibleNew(false)} size="small"/>
            </div>
            <Row className="body-new-faena">
                <Steps current={currentStep} >
                    <Steps.Step title="Cliente" />
                    <Steps.Step title="Faena" />
                    <Steps.Step title="Piezas" />
                    <Steps.Step title="Personal" />
                </Steps>
            </Row>
        </Row>
        :
        <>
            <div className="tools-area">
                <Button id="create-faena" type="primary" icon="plus" onClick={() => setIsModalVisibleNew(true)}>Nueva faena</Button>
            </div>
            <div className="table-wrapper">
            {
                isLoading ?
                <Spin spinning={ true } size="large" />
                :
                <Table columns={ tableColumns } dataSource={ faenas } size="small"/>
            }
            </div>
        </>
      }
    </div>
  )
}
