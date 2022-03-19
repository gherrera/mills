import './Dashboard.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Button, Table, Row, Col, Spin, Steps, Modal, notification } from 'antd'
import { getMolinosPromise } from '../../promises'
import moment from "moment";

const { confirm } = Modal;

const Dashboard = () => {
    const [molinos, setMolinos] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        getMolinosPromise(null).then(m => {
            setMolinos(m)
            setIsLoading(false)
        })
    }, [])

    return (
        <div className='dashboard'>
            {isLoading ?
                <Spin spinning={ true } size="large" />
                :
                <Row className="block">
                    <Row className="title">
                        Resumen total de Proyectos
                    </Row>
                    <Row className="indicators">
                        <Col span={4} className="indicator">
                            <Row className="content-indicator">
                                <Col span={8} className="number">
                                    {molinos.filter(m => m.status === 'FINISHED').length}
                                </Col>
                                <Col span={16}>
                                    Faenas<br/>realizadas
                                </Col>
                            </Row>
                        </Col>
                        <Col span={4} className="indicator">
                            <Row className="content-indicator">
                                <Col span={8} className="number">
                                    {molinos.filter(m => m.status === 'STARTED').length}
                                </Col>
                                <Col span={16}>
                                    Faenas<br/>en curso
                                </Col>
                            </Row>
                        </Col>
                        <Col span={4} className="indicator">
                            <Row className="content-indicator">
                                <Col span={8} className="number">
                                    {molinos.filter(m => m.status === 'STARTED').reduce((accumulator, current) => accumulator + current.piezas, 0)}
                                </Col>
                                <Col span={16}>
                                    Piezas<br/>en movimiento
                                </Col>
                            </Row>
                        </Col>
                        <Col span={4} className="indicator">
                            <Row className="content-indicator">
                                <Col span={8} className="number">
                                    
                                </Col>
                                <Col span={16}>
                                    
                                </Col>
                            </Row>
                        </Col>
                        <Col span={8} className="indicator">
                            <Row className="content-indicator">
                                <Col span={16}>
                                    <div>Ultimo cliente:</div>
                                    <div style={{fontWeight:'bold'}}>{molinos && molinos.length > 0 ? molinos[0].faena.client.name: 'N/A'}</div>
                                </Col>
                                <Col span={8}>
                                    {molinos && molinos.length > 0 ? moment(molinos[0].creationDate).format('MMMM YYYY'): 'N/A'}
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                </Row>
            }
        </div>
    )
}

export default withRouter(Dashboard)