import './Dashboard.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Statistic, DatePicker, Row, Col, Spin, Skeleton, Select, Button, Tooltip, Radio } from 'antd'
import { getMolinosPromise, getMolinoPromise } from '../../promises'
import moment from "moment";
import Plot from "react-plotly.js";

const Dashboard = ({currentUser}) => {
    const { t } = useTranslation()

    const [molinos, setMolinos] = useState([])
    const [clientes, setClientes] = useState([])
    const [cliente, setCliente] = useState(null)
    const [molino, setMolino] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMolinos, setIsLoadingMolinos] = useState(false)
    const [isLoadingMolino, setIsLoadingMolino] = useState(false)
    const [fecha, setFecha] = useState(null)
    const [fechaFilter, setFechaFilter] = useState(null)
    const [maxGraph, setMaxGraph] = useState(10)
    const [avances, setAvances] = useState({})
    const [ dataGraph, setDataGraph ] = useState([])
    const [ groupGraph, setGroupGraph ] = useState("turno")
    const [ totalHoras, setTotalHoras ] = useState(0)
    const [ totalExec, setTotalExec ] = useState(0)

    useEffect(() => {
        init()
        if(currentUser.type === 'DASHBOARD' && currentUser.client) {
            setCliente(currentUser.client.id)
        }
    }, [])

    useEffect(() => {
        if(molino) {
            setStatsAvances(fechaFilter, molino)
        }
    }, [groupGraph])

    useEffect(() => {
        if(molino) {
            let f = moment()
            if(molino.currentStage) {
                if(molino.currentStage.finishDate) {
                    f = moment(molino.currentStage.finishDate)
                }else {
                    f = moment(molino.currentStage.creationDate)
                }
            }
            setFecha(f)

            let d = new Date(f.startOf('day'))
            d.setDate(d.getDate() + 1);
            setStatsAvances(moment(d), molino)
            setIsLoadingMolino(false)
        }
    }, [molino])

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
            let total = 0
            let totalE = 0
            if(m.scheduled && m.scheduled.movs) {
                total = m.scheduled.movs.reduce((accumulator, current) => accumulator + current.total, 0)
                totalE = m.scheduled.movs.reduce((accumulator, current) => accumulator + (current.movs ? current.movs : 0), 0)
            }
            setTotalHoras(total)
            setTotalExec(totalE)
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

    const getScheduledByParams = (movs, hour, turnos) => {
        let sched = 0
        let schedExec = 0
        let mounted = 0
        const keyTurno = turnos[turnos.length-1].key
        const filteredTurnos = movs.filter(m => m.turn === keyTurno)
        for(let i=0;i<movs.length;i++) {
            if(movs[i].turn !== keyTurno) {
                sched += movs[i].total
                if(movs[i].movs) {
                    schedExec += movs[i].movs
                }
                if(movs[i].mounted) {
                    mounted += movs[i].mounted
                }
            }else {
                break;
            }
        }
        for(let i=0;i<filteredTurnos.length;i++) {
            if(i < hour) {
                sched += filteredTurnos[i].total
                if(filteredTurnos[i].movs) {
                    schedExec += filteredTurnos[i].movs
                }
                if(filteredTurnos[i].mounted) {
                    mounted += filteredTurnos[i].mounted
                }
            }else {
                break
            }
        }
        return { sched, schedExec, mounted }
    }

    const getAbreviadoTurno = (turno) => {
        //return t('messages.mills.turno.' + turno.name)
        return turno.name.substring(0,1)
    }

    const addHourRange = (pMolino, listValues, o, turnoId, turnos, last, i) => {
        if(pMolino.scheduled) {
            // Programado
            if(pMolino.scheduled.movs) {
                let t = turnos
                if(last.turno !== turnoId) {
                    const lastTurno = turnos[turnos.length-1]
                    t = turnos.filter(t => t.key !== lastTurno.key)
                }
                let s = getScheduledByParams(pMolino.scheduled.movs, i, t)
                
                o.scheduled = s.sched
                o.scheduledExec = s.schedExec
                o.scheduledMounted = s.mounted
            }
        }
        listValues.push(o)
    }

    const addHours = (pMolino, listValues, ejeX, hour, turnoId, turnos) => {
        let last = { hour: 12, ejeX, scheduled: 0, scheduledExec: 0, scheduledMounted: 0}
        if(listValues.length > 0) last = listValues[listValues.length-1]
        let x = last.ejeX.substring(0, last.ejeX.lastIndexOf(':') + 1)
        if(last.turno !== turnoId || (hour - last.hour) > 1) {
            let lastH = 12
            if(last.turno === turnoId) {
                lastH = hour-1
            }
            for(let i=last.hour+1; i<=lastH; i++) {
                const o = {key: (last.turno + '-' + i), ejeX: (x + i), hour: i, movs: 0, movsExec: 0, montadas: 0, scheduled: last.scheduled, giros: 0, scheduledExec: last.scheduledExec, scheduledMounted: last.scheduledMounted,turno: last.turno}
                addHourRange(pMolino, listValues, o, turnoId, turnos, last, i)
            }
            if(last.turno !== turnoId) {
                x = ejeX.substring(0, ejeX.lastIndexOf(':') + 1)
                for(let i=1; i<hour; i++) {
                    const o = {key: (turnoId + '-' + i), ejeX: (x + i), hour: i, movs: 0, movsExec: 0, montadas: 0, scheduled: last.scheduled, giros: 0, scheduledExec: last.scheduledExec, scheduledMounted: last.scheduledMounted, turno: turnoId}
                    addHourRange(pMolino, listValues, o, turnoId, turnos, o, i)
                }
            }
        }
    }

    const getStatsAvancesByFecha = (pFecha, pMolino, groupBy='fecha') => {
        let avObj = { }
        const f = new Date(pFecha)

        let listValues = []
        let turnosExec = {}
        let turnos = []
        let durationTurnos = 0;

        pMolino.stages && pMolino.stages.map(s => {
            if(s.stage === 'BEGINNING' || s.stage === 'FINISHED') {
                s.tasks && s.tasks.map(task => {
                    if(task.finishDate) {
                        let fecTask = moment(task.finishDate)

                        if(fecTask.isBefore(pFecha)) {
                            const initTurno = moment(task.turnoFinish.creationDate)
                            let hour = Math.ceil((task.finishDate - task.turnoFinish.creationDate) / 1000 / 3600)
                            if(hour > 12) hour = 12
                            const keyFecha = fecTask.format("DD-MM-YYYY")
                            let key = keyFecha
                            let ejeX = key
                            if(groupBy === 'turno') {
                                key = task.turnoFinish.id
                                ejeX = initTurno.format("DD-MM-YYYY") + '-' + getAbreviadoTurno(task.turnoFinish.turno)
                            }else if(groupBy === 'hora') {
                                key = task.turnoFinish.id + "-" + hour
                                ejeX = initTurno.format("DD-MM-YYYY") + '-' + getAbreviadoTurno(task.turnoFinish.turno) + ':' + (hour)
                            }
                            
                            let nturnos = turnos.filter(t => t.id === task.turnoStart.id).length
                            if(nturnos === 0) {
                                turnos.push({ id: task.turnoStart.id, key: 'T' + (turnos.length+1)})
                            }
                            nturnos = turnos.filter(t => t.id === task.turnoFinish.id).length
                            if(nturnos === 0) {
                                turnos.push({ id: task.turnoFinish.id, key: 'T' + (turnos.length+1)})
                            }

                            let entry = listValues.filter(v => v.key === key)
                            if(entry.length === 0) {
                                if(groupBy === 'hora') {
                                    addHours(pMolino, listValues, ejeX, hour, task.turnoFinish.id, turnos)
                                }
                                listValues.push({key, ejeX, hour, movs: 0, movsExec: 0, montadas: 0, scheduled: 0, giros: 0, scheduledExec: 0, scheduledMounted: 0, turno: task.turnoFinish.id, initTurno })
                            }
                            entry = listValues.filter(v => v.key === key)[0]
                            entry.fecha = fecTask
                            entry.hour = hour

                            if(pMolino.scheduled) {
                                if(pMolino.scheduled.tasks && pMolino.scheduled.tasks[task.task]) {
                                    entry.movs = entry.movs + pMolino.scheduled.tasks[task.task]
                                }

                                // Programado
                                if(pMolino.scheduled.movs) {
                                    let s = getScheduledByParams(pMolino.scheduled.movs, hour, turnos)
                                    
                                    entry.scheduled = s.sched
                                    entry.scheduledExec = s.schedExec
                                    entry.scheduledMounted = s.mounted
                                }
                            }
                        }
                    }
                })
            }else if(s.stage === 'EXECUTION') {
                s.tasks && s.tasks.map(task => {
                    if(task.task === 'GIRO' || task.task === 'BOTADO' || task.task === 'MONTAJE') {
                        let maxFecPart
                        let fecTask = moment(task.finishDate)
                        if(task.task === 'GIRO') {
                            if(fecTask.isBefore(pFecha)) {
                                const initTurno = moment(task.turnoFinish.creationDate)
                                let hour = Math.ceil((task.finishDate - task.turnoFinish.creationDate) / 1000 / 3600)
                                if(hour > 12) hour = 12
                                const keyFecha = fecTask.format("DD-MM-YYYY")
                                let key = keyFecha
                                let ejeX = key
                                if(groupBy === 'turno') {
                                    key = task.turnoFinish.id
                                    ejeX = initTurno.format("DD-MM-YYYY") + '-' + getAbreviadoTurno(task.turnoFinish.turno)
                                }else if(groupBy === 'hora') {
                                    key = task.turnoFinish.id + "-" + hour
                                    ejeX = initTurno.format("DD-MM-YYYY") + '-' + getAbreviadoTurno(task.turnoFinish.turno) + ':' + (hour)
                                }

                                let nturnos = turnos.filter(t => t.id === task.turnoStart.id).length
                                if(nturnos === 0) {
                                    turnos.push({ id: task.turnoStart.id, key: 'T' + (turnos.length+1)})
                                }
                                nturnos = turnos.filter(t => t.id === task.turnoFinish.id).length
                                if(nturnos === 0) {
                                    turnos.push({ id: task.turnoFinish.id, key: 'T' + (turnos.length+1)})
                                }

                                let entry = listValues.filter(v => v.key === key)
                                if(entry.length === 0) {
                                    if(groupBy === 'hora') {
                                        addHours(pMolino, listValues, ejeX, hour, task.turnoFinish.id, turnos)
                                    }
                                    listValues.push({ key, ejeX, hour, movs: 0, movsExec: 0, montadas: 0, scheduled: 0, giros: 0, scheduledExec: 0, scheduledMounted: 0, turno: task.turnoFinish.id })
                                }
                                entry = listValues.filter(v => v.key === key)[0]
                                entry.giros = entry.giros + 1
                                entry.fecha = fecTask
                                entry.hour = hour
                                
                                if(pMolino.scheduled) {
                                    if(pMolino.scheduled.tasks && pMolino.scheduled.tasks[task.task]) {
                                        entry.movs = entry.movs + pMolino.scheduled.tasks[task.task]
                                    }

                                    // Programado
                                    if(pMolino.scheduled.movs) {
                                        let s = getScheduledByParams(pMolino.scheduled.movs, hour, turnos)

                                        entry.scheduled = s.sched
                                        entry.scheduledExec = s.schedExec
                                        entry.scheduledMounted = s.mounted
                                    }
                                }
                                durationTurnos += task.duration
                            }
                        }else if(task.task === 'BOTADO' || task.task === 'MONTAJE') {
                            task.parts && task.parts.map(part => {
                                const fecParte = moment(part.creationDate)
                                if(fecParte.isBefore(pFecha)) {
                                    maxFecPart = fecParte
                                    const keyFecha = fecParte.format("DD-MM-YYYY")
                                    const initTurno = moment(part.turno.creationDate)
                                    let hour = Math.ceil((part.creationDate - part.turno.creationDate) / 1000 / 3600)
                                    if(hour > 12) hour = 12
                                    let key = keyFecha
                                    let ejeX = key
                                    if(groupBy === 'turno') {
                                        key = part.turno.id
                                        ejeX = initTurno.format("DD-MM-YYYY") + '-' + getAbreviadoTurno(part.turno.turno)
                                    }else if(groupBy === 'hora') {
                                        key = part.turno.id + "-" + hour
                                        ejeX = initTurno.format("DD-MM-YYYY") + '-' + getAbreviadoTurno(part.turno.turno) + ':' + (hour)
                                    }

                                    turnosExec[part.turno.id] = part.turno.id

                                    let nturnos = turnos.filter(t => t.id === part.turno.id).length
                                    if(nturnos === 0) {
                                        turnos.push({ id: part.turno.id, key: 'T' + (turnos.length+1)})
                                    }

                                    let entry = listValues.filter(v => v.key === key)
                                    if(entry.length === 0) {
                                        if(groupBy === 'hora') {
                                            addHours(pMolino, listValues, ejeX, hour, part.turno.id, turnos)
                                        }
                                        listValues.push({key, ejeX, hour, movs: 0, movsExec: 0, montadas: 0, scheduled: 0, giros: 0, scheduledExec: 0, scheduledMounted:0, turno: part.turno.id, initTurno})
                                    }
                                    entry = listValues.filter(v => v.key === key)[0]
                                    entry.fecha = fecParte
                                    entry.hour = hour
                                    entry.movs = entry.movs + part.qty
                                    entry.movsExec = entry.movsExec + part.qty
                                    if(task.task === 'MONTAJE') {
                                        entry.montadas = entry.montadas + part.qty
                                    }
                                    
                                    if(pMolino.scheduled) {
                                        // Programado
                                        if(pMolino.scheduled.movs) {
                                            let s = getScheduledByParams(pMolino.scheduled.movs, hour, turnos)
                                            
                                            entry.scheduled = s.sched
                                            entry.scheduledExec = s.schedExec
                                            entry.scheduledMounted = s.mounted
                                        }
                                    }
                                }
                            })
                        }
                        if(task.finishDate && fecTask.isBefore(pFecha)) {
                            durationTurnos += task.duration
                        }else if(maxFecPart) {
                            let secs = Math.ceil((maxFecPart.valueOf() - task.creationDate) / 1000)
                            durationTurnos += secs
                        }
                    }
                })
            }
        })

        if(listValues.length > 0 && pMolino.scheduled.movs) {
            const last = listValues[listValues.length-1]
            if(last.initTurno) {
                let lastTurno = turnos[turnos.length-1].key.substring(1) * 1
                let fecha = last.fecha
                let lastHour = last.hour
                let turno = last.ejeX.split(':')[0].split('-')[3]
                while(fecha.isBefore(pFecha)) {
                    lastHour++
                    if(lastHour === 13) {
                        lastHour = 1
                        lastTurno++
                        if(turno === 'D') turno = 'N'
                        else turno = 'D'
                    }
                    fecha = fecha.add(1, 'hours')
                    if(fecha.isBefore(pFecha)) {
                        const keyFecha = fecha.format("DD-MM-YYYY")
                        const keyTurno = 'T' + lastTurno
                        if(pMolino.scheduled.movs.find(t => t.turn === keyTurno && t.turnHour === lastHour)) {
                            let ejeX = keyFecha + '-' + turno + ':' + lastHour
                            if(groupBy === 'turno') {
                                ejeX = keyFecha + '-' + turno
                            }else if(groupBy === 'fecha') {
                                ejeX = keyFecha
                            }

                            let nturnos = turnos.filter(t => t.key === keyTurno).length
                            if(nturnos === 0) {
                                turnos.push({ key: keyTurno })
                            }
                            
                            let entry = listValues.filter(v => v.ejeX === ejeX)
                            if(entry.length === 0) {
                                entry = {key: keyTurno + '-' + lastHour, ejeX, hour: lastHour}
                                listValues.push(entry)
                            }else {
                                entry = listValues[listValues.length-1]
                            }
                            const s = getScheduledByParams(pMolino.scheduled.movs, lastHour, turnos)
                            entry.scheduled =  s.sched
                            entry.scheduledExec = s.schedExec
                            entry.scheduledMounted = s.mounted
                        }else {
                            break
                        }
                    }
                }
            }
        }
        
        const giros = listValues.reduce((accumulator, current) => accumulator + (current.giros ? current.giros : 0), 0)
        const movs = listValues.reduce((accumulator, current) => accumulator + (current.movs ? current.movs : 0), 0)
        const movsExec = listValues.reduce((accumulator, current) => accumulator + (current.movsExec ? current.movsExec : 0), 0)
        const montadas = listValues.reduce((accumulator, current) => accumulator + (current.montadas ? current.montadas : 0), 0)
        avObj.giros = giros

        let scheduled = 0
        let scheduledExec = 0
        let scheduledMounted = 0
        if(listValues.length > 0) {
            scheduled = listValues[listValues.length-1].scheduled
            scheduledExec = listValues[listValues.length-1].scheduledExec
            scheduledMounted = listValues[listValues.length-1].scheduledMounted

            for(let i=listValues.length-1;i>0;i--) {
                let _movs = 0;
                let _movsExec = 0;
                for(let j=0;j<i;j++) {
                    _movs += listValues[j].movs
                    _movsExec += listValues[j].movsExec
                }
                listValues[i].movs = listValues[i].movs + _movs
                listValues[i].movsExec = listValues[i].movsExec + _movsExec
            }
            listValues.map((l, index) => {
                if(l.giros > 0) l.ngiros = l.movs
                if(groupBy === 'turno') l.ejeX = l.ejeX + "-" + (index+1)
            })

            listValues.unshift({ ejeX: 'Origen', movs: 0, scheduled: 0})
        }

        const nTurnos = Object.values(turnosExec).length
        avObj.promMovTurno = nTurnos === 0 ? 0 : Math.round(movsExec/nTurnos)
        avObj.promMinPieza = montadas === 0 ? 0 : (durationTurnos / 60 / montadas).toFixed(1)
        avObj.promMinMov = movsExec === 0 ? 0 : (durationTurnos / 60 / movsExec).toFixed(1)
        avObj.hasRetraso = movs < scheduled ? 'Sí' : 'No'

        avObj.movimientosReal = movsExec
        avObj.montadas = montadas
        avObj.movimientosProg = scheduledExec
        avObj.piezasProg = scheduledMounted
        avObj.avance = Math.round(movs / totalHoras * 100)

        avObj.values = listValues
        return avObj
    }

    const setStatsAvances = (pFecha, pMolino) => {
        setFechaFilter(pFecha)
        let avObj = getStatsAvancesByFecha(pFecha, pMolino, groupGraph)
        let vGraph = avObj.values
        const movMax = Math.max(...vGraph.map(o => o.movs))
        const movScheduled = Math.max(...vGraph.map(o => o.scheduled))
        if(movScheduled > movMax) {
            setMaxGraph(movScheduled)
        }else {
            setMaxGraph(movMax)
        }

        setDataGraph(vGraph)
        setAvances(avObj)
    }

    const handleChangeAvance = (value) => {
        if(value === null) value = moment()
        let f = new Date(value.startOf('day'))
        let hoy = new Date(moment().startOf('day'))
        //if(hoy.getTime() < f.getTime()) f = hoy

        if(molino.currentStage) {
            let fec
            if(molino.currentStage.finishDate) {
                fec = moment(molino.currentStage.finishDate)
            }else {
                fec = moment(molino.currentStage.creationDate)
            }
            fec = new Date(fec.startOf('day'))
            //if(fec.getTime() < f.getTime()) f = fec
        }

        f = moment(f)
        setFecha(f)
        let d = new Date(f.startOf('day'))
        d.setDate(d.getDate() + 1);

        setStatsAvances(moment(d), molino)
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

    const onChangeGroup = (val) => {
        setGroupGraph(val.target.value)
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
                                            <Row type="flex" gutter={[12,12]}>
                                                <Col span={9} md={{span:9}} xs={12} className="indicador-avance">
                                                    <Col className="indicador-block">
                                                        Movimientos programados Totales
                                                        <div className="indicador-number">
                                                            {totalExec}
                                                        </div>
                                                    </Col>
                                                </Col>
                                                <Col span={9} md={{span:9, offset:5}} xs={{span: 12, offset:0}} offset={5} className="indicador-avance">
                                                    <Col className="indicador-block">
                                                        Piezas programadas Totales
                                                        <div className="indicador-number">
                                                            {Math.floor(totalExec/2)}
                                                        </div>
                                                    </Col>
                                                </Col>
                                            </Row>
                                        </Row>
                                    </Col>
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
                                                <Col xs={8} lg={5}>
                                                    <Statistic title="Prom Mov/Turno" value={avances.promMovTurno}/>
                                                </Col>
                                                <Col xs={8} lg={5}>
                                                    <Statistic title="Prom Min/Pieza" value={avances.promMinPieza}/>
                                                </Col>
                                                <Col xs={8} lg={5}>
                                                    <Statistic title="Prom Min/Mov" value={avances.promMinMov}/>
                                                </Col>
                                                <Col xs={12} lg={5}>
                                                    <Statistic title="Giros" value={avances.giros}/>
                                                </Col>
                                                <Col xs={12} lg={4}>
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
                                                                    {Math.floor(avances.piezasProg)}
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
                                                            Avance
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
                                            { (currentUser.type !== 'DASHBOARD' || !currentUser.client) &&
                                                <Col style={{textAlign:'right'}}>
                                                    <Radio.Group onChange={onChangeGroup} defaultValue={groupGraph} size='small'>
                                                        <Radio value="fecha">Diario</Radio>
                                                        <Radio value="turno">Turno</Radio>
                                                        <Radio value="hora">Hora</Radio>
                                                    </Radio.Group>
                                                </Col>
                                            }
                                            <Col>
                                                <Plot
                                                    useResizeHandler={true}
                                                    style={{width: "100%", height: "100%"}}
                                                    data={
                                                        [
                                                            // Avance real
                                                            {
                                                                x: dataGraph.map(d => d.ejeX),
                                                                y: dataGraph.map(d => d.movs / totalHoras * 100),
                                                                hovertemplate: '%{text}',
                                                                text: dataGraph.map(d  => (d.ejeX + ": " + (totalHoras > 0 ? Math.round(d.movs / totalHoras * 100) + '% (' + d.movs + ')' : 'N/A'))),
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
                                                                y: dataGraph.map(d => d.scheduled / totalHoras * 100),
                                                                hovertemplate: '%{text}',
                                                                text: dataGraph.map(d  => (d.ejeX + ": " + (totalHoras > 0 ? Math.round(d.scheduled / totalHoras * 100) + '% (' + d.scheduled + ')' : 'N/A'))),
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
                                                                y: dataGraph.map(d => d.ngiros / totalHoras * 100),
                                                                hovertemplate: '%{text} Giro(s)',
                                                                //hoverinfo: "label+percent+name+text",
                                                                text: dataGraph.map(d  => (d.ejeX + ": " + d.giros)),
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
                                                                b: groupGraph === 'hora' && dataGraph.length > 40 ? 90 : groupGraph === 'hora' && dataGraph.length > 18 ? 50 : 20,
                                                                t: 0
                                                            },
                                                            paper_bgcolor: 'rgba(0,0,0,0)',
                                                            plot_bgcolor: 'rgba(0,0,0,0)',
                                                            autoscale: true,
                                                            xaxis: {
                                                                automargin: true,
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
                                                                range: [0, (maxGraph / totalHoras * 110)],
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
                                            </Col>
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