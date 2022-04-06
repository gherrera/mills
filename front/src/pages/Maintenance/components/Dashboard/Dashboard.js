import './Dashboard.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Statistic, DatePicker, Row, Col, Spin, Skeleton, Select } from 'antd'
import { getMolinosPromise, getMolinoPromise } from '../../promises'
import moment from "moment";
import Plot from "react-plotly.js";

const Dashboard = () => {
    const [molinos, setMolinos] = useState([])
    const [clientes, setClientes] = useState([])
    const [cliente, setCliente] = useState(null)
    const [molino, setMolino] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMolino, setIsLoadingMolino] = useState(false)
    const [fecha, setFecha] = useState(null)
    const [avances, setAvances] = useState({})
    const [ days, setDays ] = useState([])
    const [ dataGraph, setDataGraph ] = useState([])

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
        setIsLoadingMolino(true)
        getMolinoPromise(id).then(m => {
            setMolino(m)
            let f = moment()
            m.stages && m.stages.map(s => {
                if(s.stage === 'EXECUTION' && s.finishDate) {
                    f = moment(s.finishDate)
                }
            })

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

    const getStatsAvancesByFecha = (pFecha, pMolino) => {
        let avObj = {...avances}
        const f = new Date(pFecha.format())

        let giros = 0
        let turnos = {}
        let hasFihishExec = false
        pMolino.stages && pMolino.stages.map(s => {
            if(s.stage === 'EXECUTION') {
                if(s.finishDate) {
                    let fec = moment(s.finishDate)
                    if(fec.isBefore(pFecha)) hasFihishExec = true
                }
                s.tasks && s.tasks.map(task => {
                    if(task.task === 'GIRO' || task.task === 'BOTADO' || task.task === 'MONTAJE') {
                        if(task.task === 'GIRO') {
                            let fec = moment(task.creationDate)
                            if(fec.isBefore(pFecha)) giros++
                        }else if(task.task === 'BOTADO' || task.task === 'MONTAJE') {
                            task.parts && task.parts.map(part => {
                                let fecParte = moment(part.creationDate)

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
                                    if(!turnos[part.turno.id]) turnos[part.turno.id] = {qty : 0, duration: (fecFin - fecIni)/1000}
                                    if(fecParte.isBefore(pFecha)) turnos[part.turno.id].qty = turnos[part.turno.id].qty + part.qty
                                }
                            })
                        }
                    }
                })
            }
        })

        avObj.giros = giros
        const movs = Object.entries(turnos).reduce((accumulator, current) => {
            return accumulator + current[1].qty
        }, 0)
        const durationTurnos = Object.entries(turnos).reduce((accumulator, current) => {
            return accumulator + current[1].duration
        }, 0)
        const nTurnos = Object.entries(turnos).length
        avObj.promMovTurno = nTurnos === 0 ? 0 : Math.round(movs/nTurnos)
        avObj.promMinPieza = movs === 0 ? 'N/A' : (durationTurnos / 60 / (movs / 2)).toFixed(1)
        avObj.avance = Math.round(movs / (pMolino.piezas * 2) * 100)

        const segPiezaMeta = pMolino.exHours * 3600 / (pMolino.piezas * 2)
        const segPiezaReal = durationTurnos / movs
        avObj.hasRetraso = durationTurnos === 0 ? 'N/A' : segPiezaReal > segPiezaMeta ? 'Sí' : 'No'

        avObj.movimientosReal = movs
        let tpo = durationTurnos / (pMolino.exHours * 3600)
        if(tpo > 1) tpo = 1
        avObj.movimientosProg = Math.round(tpo * pMolino.piezas * 2)
        if(hasFihishExec) avObj.movimientosProg = movs
        avObj.avanceProg = Math.round(avObj.movimientosProg / (pMolino.piezas * 2) * 100)

        return avObj
    }

    const setStatsAvances = (pFecha, pMolino) => {
        let fecIni=null
        pMolino.stages && pMolino.stages.map(s => {
            if(s.stage === 'EXECUTION') {
                fecIni = moment(s.creationDate)
            }
        })
        let vDays = []
        let vGraph = []
        if(fecIni) {
            const date2 = new Date(pFecha.startOf('day')).getTime()
            const date1 = new Date(fecIni.startOf('day')).getTime()
            const d = Math.floor((date2-date1)/(1000*60*60*24));
            
            for(let i=0;i<d;i++) {
                let f = new Date(fecIni.startOf('day'))
                f.setDate(f.getDate() + i)
                let vFec = moment(f).startOf('day')
                
                let fecha = vFec.format("DD-MM-YYYY")

                f.setDate(f.getDate() + 1)
                vFec = moment(f).startOf('day')
                let avObj = getStatsAvancesByFecha(vFec, pMolino)
                avObj.fecha = fecha
                
                vGraph.push(avObj)
                vDays.push(vFec.format("DD-MM-YYYY"))
            }
        }

        setDataGraph(vGraph)
        setDays(vDays)
        
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
            {isLoading ?
                <Spin size="large" />
                :
                <>
                    <Row className="block">
                        <Row className="title">
                            Resumen total de Proyectos
                        </Row>
                        <Row className="indicators" gutter={[8,8]} type="flex">
                            <Col span={4} xs={12} md={4}>
                                <Row className="indicator">
                                    <Col span={8} className="number">
                                        { clientes.length }
                                    </Col>
                                    <Col span={16} style={{paddingLeft: 5}}>
                                        Clientes
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={4} xs={12} md={4}>
                                <Row className="indicator">
                                    <Col span={8} className="number">
                                        {molinos.filter(m => m.status === 'FINISHED').length}
                                    </Col>
                                    <Col span={16} style={{paddingLeft: 5}}>
                                        Faenas<br/>realizadas
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={4} xs={12} md={4}>
                                <Row className="indicator">
                                    <Col span={8} className="number">
                                        {molinos.filter(m => m.status === 'STARTED').length}
                                    </Col>
                                    <Col span={16} style={{paddingLeft: 5}}>
                                        Faenas<br/>en curso
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={4} xs={12} md={4}>
                                <Row className="indicator">
                                    <Col span={8} className="number">
                                        {molinos.filter(m => m.status === 'STARTED').reduce((accumulator, current) => accumulator + current.piezas, 0)}
                                    </Col>
                                    <Col span={16} style={{paddingLeft: 5}}>
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
                    </Row>
                    <Row className="block">
                        <Row>
                            <Row gutter={[16,16]}>
                                <Col span={12} xs={24} md={12}>
                                    <Row className="title">
                                        Principales indicadores por Proyecto
                                    </Row>
                                </Col>
                                <Col span={6} xs={14} md={6}>
                                    <Select style={{width:'100%'}} placeholder="Cliente" onChange={(value) => setCliente(value)} allowClear>
                                        { clientes.map(c => 
                                            <Select.Option value={c.id}>{c.name}</Select.Option>
                                        )}
                                    </Select>
                                </Col>
                                <Col span={6} xs={10} md={6}>
                                    <Select style={{width:'100%'}} placeholder="Orden de Trabajo" onChange={handleChangeMolino}>
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
                                        Faena
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
                                    <Col xs={24} lg={12}>
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
                                                                    {Math.floor(avances.movimientosReal/2)}
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
                                    <Col xs={24} lg={12}>
                                        <Row style={{backgroundColor:'rgba(255,255,255,.9)', padding: 4, height: '100%'}}>
                                            <Plot
                                                useResizeHandler={true}
                                                style={{width: "100%", height: "100%"}}
                                                data={
                                                    [
                                                        // Avance real
                                                        {
                                                            x: dataGraph.map(d => d.fecha),
                                                            y: dataGraph.map(d => d.avance),
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
                                                            x: dataGraph.map(d => d.fecha),
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
                                                            t: 20,
                                                        },
                                                        //title: 'Tramos de Venta',
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
                                                            range: [0, 110],
                                                            tickmode: 'array',
                                                            showgrid: true,
                                                            gridcolor: 'rgb(187 187 187)',
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