import './Dashboard.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Button, Table, Row, Col, Spin, Steps, Modal, Select } from 'antd'
import { getMolinosPromise, getMolinoPromise } from '../../promises'
import moment from "moment";

const { confirm } = Modal;

const Dashboard = () => {
    const [molinos, setMolinos] = useState([])
    const [clientes, setClientes] = useState([])
    const [cliente, setCliente] = useState(null)
    const [molino, setMolino] = useState(null)
    const [ots, setOts] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        getMolinosPromise(null).then(m => {
            setMolinos(m)

            const uniqueClientes = [];
            m.map((item) => {
                var findItem = uniqueClientes.find((x) => x.id === item.faena.client.id);
                if (!findItem) uniqueClientes.push(item.faena.client);
            });
            setClientes(uniqueClientes)

            setIsLoading(false)
        })
    }, [])

    const handleChangeMolino = (id) => {
        getMolinoPromise(id).then(m => {
            setMolino(m)
        })
    }

    const getTasksByTurno = (turno, tasks) => {
        let parts = 0
        molino.stages.map(st => {
            st.stage === 'EXECUTION' && st.tasks && st.tasks.map(t => {
                tasks.includes(t.task) && t.parts && t.parts.map(p => {
                    if(p.turno.id === turno.id) {
                        parts += p.qty
                    }
                })
            })
        })
        return parts
    }

    const getTotalByTurno = (tasks) => {
        let parts = 0
        molino.stages.map(st => {
            st.stage === 'EXECUTION' && st.tasks && st.tasks.map(t => {
                tasks.includes(t.task) && t.parts && t.parts.map(p => {
                    parts += p.qty
                })
            })
        })
        return parts
    }

    return (
        <div className='dashboard'>
            {isLoading ?
                <Spin spinning={ true } size="large" />
                :
                <>
                    <Row className="block">
                        <Row className="title">
                            Resumen total de Proyectos
                        </Row>
                        <Row className="indicators" gutter={[8,8]}>
                            <Col span={4}>
                                <Row className="indicator">
                                    <Col span={8} className="number">
                                        {molinos.filter(m => m.status === 'FINISHED').length}
                                    </Col>
                                    <Col span={16}>
                                        Faenas<br/>realizadas
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={4}>
                                <Row className="indicator">
                                    <Col span={8} className="number">
                                        {molinos.filter(m => m.status === 'STARTED').length}
                                    </Col>
                                    <Col span={16}>
                                        Faenas<br/>en curso
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={4}>
                                <Row className="indicator">
                                    <Col span={8} className="number">
                                        {molinos.filter(m => m.status === 'STARTED').reduce((accumulator, current) => accumulator + current.piezas, 0)}
                                    </Col>
                                    <Col span={16}>
                                        Piezas<br/>en movimiento
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={4}>
                                <Row className="indicator">
                                    <Col span={8} className="number">
                                        
                                    </Col>
                                    <Col span={16}>
                                        
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={8}>
                                <Row className="indicator">
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
                    <Row className="block">
                        <Row>
                            <Row gutter={[16,16]}>
                                <Col span={12}>
                                    <Row className="title">
                                        Principales indicadores por Proyecto
                                    </Row>
                                </Col>
                                <Col span={6}>
                                    <Select style={{width:'100%'}} placeholder="Cliente" onChange={(value) => setCliente(value)} allowClear>
                                        { clientes.map(c => 
                                            <Select.Option value={c.id}>{c.name}</Select.Option>
                                        )}
                                    </Select>
                                </Col>
                                <Col span={6}>
                                    <Select style={{width:'100%'}} placeholder="Orden de Trabajo" onChange={handleChangeMolino}>
                                        { molinos.map(m => 
                                            (!cliente || cliente === m.faena.client.id) && m.status &&
                                            <Select.Option value={m.id}>{m.ordenTrabajo}</Select.Option>
                                        )}
                                    </Select>
                                </Col>
                            </Row>
                        </Row>

                        { molino &&
                            <>
                                <Row style={{backgroundColor:'rgba(255,255,255,.9)', padding: 5, marginTop: 5}}>
                                    <Row style={{padding: 5, borderBottom:'1px solid rgba(0,0,0,.8)'}}>
                                        Faena
                                    </Row>
                                    <Row style={{padding: 10}}>
                                        <Col span={8} style={{textAlign:'center'}}>
                                            <div>
                                                Tipo de Equipo
                                                <span style={{backgroundColor: 'rgba(0,0,0,.08)', marginLeft:15, padding:'2px 10px'}}>
                                                    {molino.type}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col span={8} style={{textAlign:'center'}}>
                                            <div>
                                                Nombre de Equipo
                                                <span style={{backgroundColor: 'rgba(0,0,0,.08)', marginLeft:15, padding:'2px 10px'}}>
                                                    {molino.name}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col span={8} style={{textAlign:'center'}}>
                                            <div>
                                                Contacto Cliente
                                                <span style={{backgroundColor: 'rgba(0,0,0,.08)', marginLeft:15, padding:'2px 10px'}}>
                                                    {molino.faena.client.contactName}
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row style={{marginTop: 5}} gutter={[8,8]}>
                                    <Col span={18}>
                                        <div style={{backgroundColor:'rgba(255,255,255,.9)', padding: 5, height: '150px'}}>
                                            <Row gutter={[6,6]}>
                                                <Col span={3}>
                                                    <div className="turno-header">Turno</div>
                                                </Col>
                                                { molino.turnoHistorial.map((t, index) =>
                                                    <Col span={2} style={{width: (79/molino.turnoHistorial.length) + '%'}}>
                                                        <div className="turno-header">{index+1}</div>
                                                    </Col>
                                                )}
                                                <Col span={2}>
                                                    <div className="turno-header">Total</div>
                                                </Col>
                                            </Row>
                                            <Row gutter={[6,6]}>
                                                <Col span={3}>
                                                    <div className="stat-stage">Botado</div>
                                                </Col>
                                                { molino.turnoHistorial.map((t, index) =>
                                                    <Col span={2} style={{width: (79/molino.turnoHistorial.length) + '%'}}>
                                                        <div className="stat-number">{getTasksByTurno(t, ['BOTADO'])}</div>
                                                    </Col>
                                                )}
                                                <Col span={2}>
                                                    <div className="stat-number">{getTotalByTurno(['BOTADO'])}</div>
                                                </Col>
                                            </Row>
                                            <Row gutter={[6,6]}>
                                                <Col span={3}>
                                                    <div className="stat-stage">Montaje</div>
                                                </Col>
                                                { molino.turnoHistorial.map((t, index) =>
                                                    <Col span={2} style={{width: (79/molino.turnoHistorial.length) + '%'}}>
                                                        <div className="stat-number">{getTasksByTurno(t, ['MONTAJE'])}</div>
                                                    </Col>
                                                )}
                                                <Col span={2}>
                                                    <div className="stat-number">{getTotalByTurno(['MONTAJE'])}</div>
                                                </Col>
                                            </Row>
                                            <Row gutter={[6,6]}>
                                                <Col span={3}>
                                                    <div className="stat-stage">Rendimiento Movimiento/Turno</div>
                                                </Col>
                                                { molino.turnoHistorial.map((t, index) =>
                                                    <Col span={2} style={{width: (79/molino.turnoHistorial.length) + '%'}}>
                                                        <div className="stat-number">{getTasksByTurno(t, ['BOTADO','MONTAJE'])}</div>
                                                    </Col>
                                                )}
                                                <Col span={2}>
                                                    <div className="stat-number">{getTotalByTurno(['BOTADO','MONTAJE'])}</div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <div style={{backgroundColor:'rgba(255,255,255,.9)', padding: 5, height: '150px'}}>
                                            <Row style={{padding: 4}}>
                                                <Col span={12}>Nro. piezas a montar</Col>
                                                <Col span={12} style={{textAlign:'right'}}>{molino.piezas}</Col>
                                            </Row>
                                            <Row style={{padding: 4}}>
                                                <Col span={12}>Equipo de Trabajo</Col>
                                                <Col span={12} style={{textAlign:'right'}}>{molino.turns.length}</Col>
                                            </Row>
                                            <Row style={{padding: 4}}>
                                                <Col span={12}>Total de operarios p/turno</Col>
                                                <Col span={12} style={{textAlign:'right'}}>{molino.turns.reduce((acum, current) => acum + current.personas.length, 0)}</Col>
                                            </Row>
                                            <Row style={{padding: 4}}>
                                                <Col span={12}>Inicio</Col>
                                                <Col span={12} style={{textAlign:'right'}}>{moment(molino.startDate).format('DD/MM/YYYY HH:mm')}</Col>
                                            </Row>
                                            <Row style={{padding: 4}}>
                                                <Col span={12}>Fin real</Col>
                                                <Col span={12} style={{textAlign:'right'}}>{molino.status === 'FINISHED' ? moment(molino.finishDate).format('DD/MM/YYYY HH:mm') : 'En curso'}</Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </>
                        }
                    </Row>
                </>
            }
        </div>
    )
}

export default withRouter(Dashboard)