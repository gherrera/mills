import './Dashboard.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Statistic, DatePicker, Row, Col, Spin, Skeleton, Select, Button, Tooltip } from 'antd'
import { getMolinosPromise, getMolinoPromise } from '../../promises'
import moment from "moment";
import Plot from "react-plotly.js";

const Dashboard = ({currentUser}) => {
    const [molinos, setMolinos] = useState([])
    const [clientes, setClientes] = useState([])
    const [cliente, setCliente] = useState(null)
    const [molino, setMolino] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMolinos, setIsLoadingMolinos] = useState(false)
    const [isLoadingMolino, setIsLoadingMolino] = useState(false)
    const [fecha, setFecha] = useState(null)
    const [maxGraph, setMaxGraph] = useState(10)
    const [avances, setAvances] = useState({})
    const [ dataGraph, setDataGraph ] = useState([])

    useEffect(() => {
        init()
        if(currentUser.type === 'DASHBOARD' && currentUser.client) {
            setCliente(currentUser.client.id)
        }
    }, [])

    const loadMolinos = async () => {
        setIsLoadingMolinos(true)
        return getMolinosPromise(null).then(m => {
            setMolinos(m)

            const uniqueClientes = [];
            m.map(item => {
                var findItem = uniqueClientes.find((x) => x.id === item.faena.client.id);
                if (!findItem) uniqueClientes.push(item.faena.client);
            });
            setClientes(uniqueClientes)
            setIsLoadingMolinos(false)
        })
    }

    const init = async () => {
        setIsLoading(true)
        await loadMolinos()
        setIsLoading(false)
    }

    const handleRefreshMolino = () => {
        if(molino) {
            handleChangeMolino(molino.id)
        }
    }

    const changeCliente = (value) => {
        setCliente(value)
        setMolino(null)
    }

    const handleChangeMolino = (id) => {
        setIsLoadingMolino(true)
        getMolinoPromise(id).then(m => {
            setMolino(m)
            let f = moment()
            if(m.currentStage) {
                if(m.currentStage.finishDate) {
                    f = moment(m.currentStage.finishDate)
                }else {
                    f = moment(m.currentStage.creationDate)
                }
            }

            setFecha(f)

            let d = new Date(f.startOf('day'))
            d.setDate(d.getDate() + 1);
            setStatsAvances(moment(d), m)
            setIsLoadingMolino(false)
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

    const getStatsAvancesByFecha = (pFecha, pMolino, groupBy='date') => {
        let avObj = { }
        const f = new Date(pFecha)
        const ant = new Date(pFecha)
        ant.setDate(f.getDate() - 1)
        const keyFecha = moment(ant).format("DD-MM-YYYY")

        let giros = 0
        let listValues = []
        let turnosExec = {}

        let hasFihishExec = false
        pMolino.stages && pMolino.stages.map(s => {
            if(s.stage === 'BEGINNING' || s.stage === 'FINISHED') {
                s.tasks && s.tasks.map(task => {
                    if(task.finishDate) {
                        let fec = moment(task.finishDate)

                        if(fec.isBefore(pFecha)) {
                            let key = keyFecha
                            let entry = listValues.filter(v => v.ejeX === key)
                            if(entry.length === 0) {
                                listValues.push({ejeX: key, movs : 0, movsExec: 0, montadas: 0, duration: 0, scheduled: 0})
                            }
                            entry = listValues.filter(v => v.ejeX === key)[0]

                            if(pMolino.scheduled && pMolino.scheduled.tasks && pMolino.scheduled.tasks[task.task]) {
                                entry.movs = entry.movs + pMolino.scheduled.tasks[task.task]
                            }
                        }
                    }
                })
            }else if(s.stage === 'EXECUTION') {
                if(s.finishDate) {
                    let fec = moment(s.finishDate)
                    if(fec.isBefore(pFecha)) hasFihishExec = true
                }
                s.tasks && s.tasks.map(task => {
                    if(task.task === 'GIRO' || task.task === 'BOTADO' || task.task === 'MONTAJE') {
                        if(task.task === 'GIRO') {
                            debugger
                            let fec = moment(task.finishDate)
                            if(fec.format("DD-MM-YYYY") === keyFecha) {
                                giros++
                                let key = keyFecha
                                let entry = listValues.filter(v => v.ejeX === key)
                                if(entry.length === 0) {
                                    listValues.push({ejeX: key, movs : 0, movsExec: 0, montadas: 0, duration: 0, scheduled: 0})
                                }
                                entry = listValues.filter(v => v.ejeX === key)[0]
                                if(pMolino.scheduled && pMolino.scheduled.tasks && pMolino.scheduled.tasks[task.task]) {
                                    entry.movs = entry.movs + pMolino.scheduled.tasks[task.task]
                                    entry.giros = entry.movs
                                }
                            }
                        }else if(task.task === 'BOTADO' || task.task === 'MONTAJE') {
                            task.parts && task.parts.map(part => {
                                const fecParte = moment(part.creationDate)

                                let fec
                                let fecIni = part.turno.creationDate
                                if(fecIni < s.creationDate) fecIni = s.creationDate

                                let fecFin = f.getTime()
                                if(part.turno.closedDate) {
                                    fec = moment(part.turno.closedDate)
                                    fecFin = part.turno.closedDate
                                    if(!fec.isBefore(pFecha)) {
                                        fec = moment(part.turno.creationDate)
                                        if(fec.isBefore(pFecha)) {
                                            fecFin = f.getTime()
                                        }
                                    }
                                }else {
                                    fec = moment(part.turno.creationDate)
                                }
                                if(fec.isBefore(pFecha)) {
                                    let key = keyFecha
                                    let entry = listValues.filter(v => v.ejeX === key)
                                    if(entry.length === 0) {
                                        listValues.push({ejeX: key, movs : 0, movsExec: 0, montadas: 0, duration: (fecFin - fecIni)/1000, scheduled: 0})
                                    }
                                    entry = listValues.filter(v => v.ejeX === key)[0]
                                    if(fecParte.isBefore(pFecha)) {
                                        entry.movs = entry.movs + part.qty
                                        entry.movsExec = entry.movsExec + part.qty
                                        if(task.task === 'MONTAJE') {
                                            entry.montadas = entry.montadas + part.qty
                                        }

                                        turnosExec[part.turno] = part.turno
                                    }
                                }
                            })
                        }
                    }
                })
            }
        })

        avObj.giros = giros
        const movsExec = listValues.reduce((accumulator, current) => {
            return accumulator + current.movsExec
        }, 0)
        const montadas = listValues.reduce((accumulator, current) => {
            return accumulator + current.montadas
        }, 0)
        const durationTurnos = listValues.reduce((accumulator, current) => {
            return accumulator + current.duration
        }, 0)
        const nTurnos = Object.values(turnosExec).length
        avObj.promMovTurno = nTurnos === 0 ? 0 : Math.round(movsExec/nTurnos)
        avObj.promMinPieza = movsExec === 0 ? 'N/A' : (durationTurnos / 60 / (movsExec / 2)).toFixed(1)

        const segPiezaMeta = pMolino.exHours * 3600 / (pMolino.piezas * 2)
        const segPiezaReal = durationTurnos / movsExec
        avObj.hasRetraso = durationTurnos === 0 ? 'N/A' : segPiezaReal > segPiezaMeta ? 'Sí' : 'No'

        avObj.movimientosReal = movsExec
        avObj.montadas = montadas
        let tpo = durationTurnos / (pMolino.exHours * 3600)
        if(tpo > 1) tpo = 1
        avObj.movimientosProg = Math.round(tpo * pMolino.piezas * 2)
        if(hasFihishExec) avObj.movimientosProg = movsExec

        avObj.avance = Math.round(movsExec / (pMolino.piezas * 2) * 100)
        avObj.avanceProg = Math.round(avObj.movimientosProg / (pMolino.piezas * 2) * 100)

        avObj.values = listValues
        return avObj
    }

    const setStatsAvances = (pFecha, pMolino) => {
        let fecIni=null
        pMolino.stages && pMolino.stages.map(s => {
            if(s.stage === 'BEGINNING') {
                fecIni = moment(s.creationDate)
            }
        })
        let vGraph = []
        if(fecIni) {
            const date2 = new Date(pFecha.startOf('day')).getTime()
            const date1 = new Date(fecIni.startOf('day')).getTime()
            const d = Math.floor((date2-date1)/(1000*60*60*24));

            debugger

            for(let i=1;i<=d;i++) {
                let f = new Date(fecIni.startOf('day'))
                f.setDate(f.getDate() + i)
                let vFec = moment(f).startOf('day')

                let values = getStatsAvancesByFecha(vFec, pMolino)

                vGraph.push(...values.values)
            }
        }

        const movMax = Math.max(...vGraph.map(o => o.movs))
        const movScheduled = Math.max(...vGraph.map(o => o.scheduled))
        if(movScheduled > movMax) {
            setMaxGraph(movScheduled)
        }else {
            setMaxGraph(movMax)
        }

        setDataGraph(vGraph)
        debugger
        let avObj = getStatsAvancesByFecha(pFecha, pMolino)
        setAvances(avObj)
    }

    const handleChangeAvance = (value) => {
        if(value === null) value = moment()
        let f = new Date(value.startOf('day'))
        let hoy = new Date(moment().startOf('day'))
        if(hoy.getTime() < f.getTime()) f = hoy

        molino.stages && molino.stages.map(s => {
            if(s.stage === 'EXECUTION' && s.finishDate) {
                let finish = new Date(moment(s.finishDate).startOf('day'))
                if(finish.getTime() < f.getTime()) f = finish
            }
        })

        f.setDate(f.getDate() + 1);

        setStatsAvances(moment(f), molino)
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
            {isLoading ? <Skeleton active />
                :
                <>
                    <Row className="title-mills">
                        <Col>
                            <div>MILLS OPERATIONAL SYSTEM</div>
                            <img src="/logo.png" alt=""/>
                        </Col>
                    </Row>
                    { currentUser.type !== 'DASHBOARD' &&
                        <Row className="block">
                            <Row className="title">
                                <Col span={20}>
                                    Resumen total de Proyectos
                                </Col>
                                <Col span={4} style={{textAlign:'right'}}>
                                    <Tooltip title="Recargar">
                                        <Button icon="reload" onClick={loadMolinos} />
                                    </Tooltip>
                                </Col>
                            </Row>
                            { isLoadingMolinos ? <Row style={{textAlign:'center', paddingTop: 10}}><Spin/></Row>
                            :
                                <Row className="indicators" gutter={[8,8]} type="flex">
                                    <Col span={4} xs={12} md={4}>
                                        <Row className="indicator">
                                            <Col span={8} className="number">
                                                { clientes.length }
                                            </Col>
                                            <Col span={16} style={{paddingLeft: 10}}>
                                                Clientes
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={4} xs={12} md={4}>
                                        <Row className="indicator">
                                            <Col span={8} className="number">
                                                {molinos.filter(m => m.status === 'FINISHED').length}
                                            </Col>
                                            <Col span={16} style={{paddingLeft: 10}}>
                                                Faenas<br/>realizadas
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={4} xs={12} md={4}>
                                        <Row className="indicator">
                                            <Col span={8} className="number">
                                                {molinos.filter(m => m.status === 'STARTED').length}
                                            </Col>
                                            <Col span={16} style={{paddingLeft: 10}}>
                                                Faenas<br/>en curso
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={4} xs={12} md={4}>
                                        <Row className="indicator">
                                            <Col span={8} className="number">
                                                {molinos.filter(m => m.status === 'STARTED').reduce((accumulator, current) => accumulator + current.piezas, 0)}
                                            </Col>
                                            <Col span={16} style={{paddingLeft: 10}}>
                                                Piezas<br/>en movimiento
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={8} xs={24} md={8}>
                                        <Row className="indicator">
                                            <Col span={12}>
                                                <div>Ultimo cliente:</div>
                                            </Col>
                                            <Col span={12} style={{textAlign:'right'}}>
                                                {molinos && molinos.length > 0 ? moment(molinos[0].creationDate).format('MMMM YYYY'): 'N/A'}
                                            </Col>
                                            <Col span={24} style={{whiteSpace: 'nowrap', overflow:'hidden', textOverflow: 'ellipsis'}}>
                                                <div style={{fontWeight:'bold'}}>{molinos && molinos.length > 0 ? molinos[0].faena.client.name: 'N/A'}</div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            }
                        </Row>
                    }
                    <Row className="block">
                        <Row>
                            <Row gutter={[16,16]}>
                                <Col span={12} xs={24} md={12}>
                                    <Row className="title">
                                        Principales indicadores por Proyecto
                                    </Row>
                                </Col>
                                { (currentUser.type !== 'DASHBOARD' || !currentUser.client) &&
                                    <Col span={6} xs={14} md={6}>
                                        <Select style={{width:'100%'}} placeholder="Cliente" value={cliente} onChange={changeCliente} allowClear>
                                            { clientes.map(c => 
                                                <Select.Option value={c.id}>{c.name}</Select.Option>
                                            )}
                                        </Select>
                                    </Col>
                                }
                                <Col span={6} xs={10} md={6}>
                                    <Select style={{width:'100%'}} placeholder="Orden de Trabajo" value={molino && molino.id}
                                        showSearch
                                        filterOption={(input, option) => 
                                            option.props.children && option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        onChange={handleChangeMolino}>
                                        { molinos.map(m => 
                                            (!cliente || cliente === m.faena.client.id) && m.status &&
                                            <Select.Option value={m.id}>{m.ordenTrabajo}</Select.Option>
                                        )}
                                    </Select>
                                </Col>
                            </Row>
                        </Row>
                        { isLoadingMolino ? <Skeleton active />
                        : molino &&
                            <>
                                <Row style={{backgroundColor:'rgba(255,255,255,.9)', padding: 4, marginTop: 5}}>
                                    <Row style={{padding: 5, borderBottom:'1px solid rgba(0,0,0,.8)'}}>
                                        <Col span={4}>Faena</Col>
                                        <Col span={16}>Fecha de actualización: <b>{moment().format('DD/MM/YYYY HH:mm')}</b></Col>
                                        <Col span={4} style={{textAlign:'right'}}>
                                            <Tooltip title="Recargar">
                                                <Button icon="reload" type="primary" onClick={handleRefreshMolino} />
                                            </Tooltip>
                                        </Col>
                                    </Row>
                                    <Row style={{padding: 10}}>
                                        <Col span={8} xs={24} sm={12} md={8} style={{textAlign:'center'}}>
                                            <div>
                                                Tipo de Equipo
                                                <span style={{backgroundColor: 'rgba(0,0,0,.08)', marginLeft:15, padding:'2px 10px'}}>
                                                    {molino.type}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col span={8} xs={24} sm={12} md={8} style={{textAlign:'center'}}>
                                            <div>
                                                Nombre de Equipo
                                                <span style={{backgroundColor: 'rgba(0,0,0,.08)', marginLeft:15, padding:'2px 10px'}}>
                                                    {molino.name}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col span={8} xs={24} sm={12} md={8} style={{textAlign:'center'}}>
                                            <div>
                                                Contacto Cliente
                                                <span style={{backgroundColor: 'rgba(0,0,0,.08)', marginLeft:15, padding:'2px 10px'}}>
                                                    {molino.faena.client.contactName}
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                </Row>
                                <Row style={{marginTop: 4}} gutter={[8,8]} type="flex">
                                    <Col span={18} xs={24} md={18}>
                                        <div style={{backgroundColor:'rgba(255,255,255,.9)', padding: 5, height: '100%'}}>
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
                                    <Col span={6} xs={24} md={6}>
                                        <div style={{backgroundColor:'rgba(255,255,255,.9)', padding: 4, height: '100%'}}>
                                            <Row style={{padding: 3}}>
                                                <Col span={20}>Nro. piezas a montar</Col>
                                                <Col span={4} style={{textAlign:'right'}}>{molino.piezas}</Col>
                                            </Row>
                                            <Row style={{padding: 3}}>
                                                <Col span={20}>Equipo de Trabajo</Col>
                                                <Col span={4} style={{textAlign:'right'}}>{molino.turns.length}</Col>
                                            </Row>
                                            <Row style={{padding: 3}}>
                                                <Col span={20}>Total operarios p/turno</Col>
                                                <Col span={4} style={{textAlign:'right'}}>{molino.turns.reduce((acum, current) => acum + current.personas.length, 0)}</Col>
                                            </Row>
                                            <Row style={{padding: 3}}>
                                                <Col span={8}>Inicio</Col>
                                                <Col span={16} style={{textAlign:'right'}}>{moment(molino.startDate).format('DD/MM/YYYY HH:mm')}</Col>
                                            </Row>
                                            <Row style={{padding: 3}}>
                                                <Col span={8}>Fin real</Col>
                                                <Col span={16} style={{textAlign:'right'}}>{molino.status === 'FINISHED' ? moment(molino.finishDate).format('DD/MM/YYYY HH:mm') : 'En curso'}</Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                                <Row style={{marginTop: 4}} gutter={[8,8]} type="flex">
                                    <Col xs={24} xxl={12}>
                                        <Row style={{backgroundColor:'rgba(255,255,255,.9)', padding: 4, height: '100%'}}>
                                            <Row style={{padding: 5, borderBottom:'1px solid rgba(0,0,0,.8)'}}>
                                                <Col span={12}>
                                                    Avances al
                                                </Col>
                                                <Col span={12} style={{textAlign:'right'}}>
                                                    <DatePicker size="small" defaultValue={fecha} format="DD/MM/YYYY" onChange={handleChangeAvance} allowClear={false} />
                                                </Col>
                                            </Row>
                                            <Row style={{padding:10}}>
                                                <Col span={6} xs={12} lg={6}>
                                                    <Statistic title="Prom Mov/Turno" value={avances.promMovTurno}/>
                                                </Col>
                                                <Col span={6} xs={12} lg={6}>
                                                    <Statistic title="Prom Min/Pieza" value={avances.promMinPieza}/>
                                                </Col>
                                                <Col span={6} xs={12} lg={6}>
                                                    <Statistic title="Giros" value={avances.giros}/>
                                                </Col>
                                                <Col span={6} xs={12} lg={6}>
                                                    <Statistic title="Retraso esperado" value={avances.hasRetraso}/>
                                                </Col>
                                            </Row>
                                            <Row style={{marginTop:10, marginBottom:10}}>
                                                <Col span={18} xs={24} sm={18}>
                                                    <Row type="flex" gutter={[12,12]}>
                                                        <Col span={10} xs={12} md={11} lg={10} className="indicador-avance">
                                                            <Col className="indicador-block">
                                                                Movimientos<br/>
                                                                programados
                                                                <div className="indicador-number">
                                                                    {avances.movimientosProg}
                                                                </div>
                                                            </Col>
                                                        </Col>
                                                        <Col span={10} xs={12} md={{span:11, offset:1}} lg={{span: 10, offset:4}} className="indicador-avance">
                                                            <Col className="indicador-block">
                                                                Piezas<br/>
                                                                programadas
                                                                <div className="indicador-number">
                                                                    {Math.floor(avances.movimientosProg/2)}
                                                                </div>
                                                            </Col>
                                                        </Col>
                                                        <Col span={10} xs={12} md={11} lg={10} className="indicador-avance">
                                                            <Col className="indicador-block">
                                                                Movimientos<br/>
                                                                reales
                                                                <div className="indicador-number">
                                                                    {avances.movimientosReal}
                                                                </div>
                                                            </Col>
                                                        </Col>
                                                        <Col span={10} xs={12} md={{span:11, offset:1}} lg={{span: 10, offset:4}} className="indicador-avance">
                                                            <Col className="indicador-block">
                                                                Piezas<br/>
                                                                cambiadas
                                                                <div className="indicador-number">
                                                                    {Math.floor(avances.montadas)}
                                                                </div>
                                                            </Col>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col span={6} style={{padding: 15}} xs={24} sm={6}>
                                                    <div className="indicador-porcentaje">
                                                        <div className="number">
                                                            {avances.avance}%
                                                            <br/>
                                                            avance
                                                        </div>
                                                        <div className="octagon">
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Row>
                                    </Col>
                                    <Col xs={24} xxl={12}>
                                        <Row style={{backgroundColor:'rgba(255,255,255,.9)', padding: 4, height: '100%'}}>
                                            <Plot
                                                useResizeHandler={true}
                                                style={{width: "100%", height: "100%"}}
                                                data={
                                                    [
                                                        // Avance real
                                                        {
                                                            x: dataGraph.map(d => d.ejeX),
                                                            y: dataGraph.map(d => d.movs),
                                                            type: 'scatter',
                                                            mode: 'lines+markers',
                                                            line: {
                                                                shape: 'spline',
                                                                smoothing: '1.1',
                                                                //width: 3,
                                                                //color: 'rgb(138 187 249)',
                                                            },
                                                            /*
                                                            marker: {
                                                                color: 'rgb(217 231 251)',
                                                                size: 6,
                                                                line: {
                                                                    color: 'rgb(138 187 249)',
                                                                    width: 1
                                                                }
                                                            },
                                                            */
                                                            name: 'Avance real'
                                                        },
                                                        // Avance estimado
                                                        {
                                                            x: dataGraph.map(d => d.ejeX),
                                                            y: dataGraph.map(d => d.avanceProg),
                                                            type: 'scatter',
                                                            mode: 'lines+markers',
                                                            line: {
                                                                shape: 'spline',
                                                                smoothing: '1.1',
                                                                //width: 3,
                                                                //color: 'rgb(138 187 249)',
                                                            },
                                                            /*
                                                            marker: {
                                                                color: 'rgb(217 231 251)',
                                                                size: 6,
                                                                line: {
                                                                    color: 'rgb(138 187 249)',
                                                                    width: 1
                                                                }
                                                            },
                                                            */
                                                            name: 'Avance programado'
                                                        },
                                                        // Giros
                                                        {
                                                            x: dataGraph.map(d => d.ejeX),
                                                            y: dataGraph.map(d => d.giros),
                                                            type: 'scatter',
                                                            mode: 'markers',
                                                            marker: {
                                                                size: 12,
                                                                color: 'rgba(255, 255, 255, 0)',
                                                                line: {
                                                                    width: 3
                                                                }
                                                            },
                                                            name: 'Giro'
                                                        }
                                                    ]
                                                }
                                                layout=
                                                {
                                                    {
                                                        hovermode: 'closest',
                                                        showlegend: true,
                                                        margin: {
                                                            l: 30,
                                                            r: 20,
                                                            b: 20,
                                                            t: 0,
                                                        },
                                                        paper_bgcolor: 'rgba(0,0,0,0)',
                                                        plot_bgcolor: 'rgba(0,0,0,0)',
                                                        autoscale: true,
                                                        xaxis: {
                                                            showgrid: false,
                                                            showticklabels: true,
                                                            tickfont: {
                                                                family: 'Arial, sans-serif',
                                                                size: 10,
                                                                color: 'rgb(103 103 103)'
                                                            },
                                                            dtick: 1
                                                        },
                                                        yaxis: {
                                                            title: 'Avance',
                                                            titlefont: {
                                                                family: 'Arial, sans-serif',
                                                                size: 10,
                                                                color: 'rgb(103 103 103)'
                                                            },
                                                            showticklabels: true,
                                                            tickfont: {
                                                                family: 'Arial, sans-serif',
                                                                size: 10,
                                                                color: 'rgb(103 103 103)'
                                                            },
                                                            range: [0, maxGraph + 15],
                                                            tickmode: 'array',
                                                            showgrid: true,
                                                            gridcolor: 'rgb(187 187 187)',
                                                        },
                                                        legend: {
                                                            x: 0,
                                                            y: 1.1,
                                                            orientation: "h"
                                                        }
                                                    }
                                                }

                                                config={{
                                                    displayModeBar: false, // this is the line that hides the bar.
                                                }}
                                            >
                                            </Plot>
                                        </Row>
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