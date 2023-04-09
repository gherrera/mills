import './Step5.scss'
import React, { useEffect, useState } from 'react'
import { Button, Row, Col, Upload, Icon, Table, notification } from 'antd'
import { uploadSchedulePromise } from '../../../../promises'
import apiConfig from '../../../../../../config/api'

const Step5 = ({ prevStep, saveFaena, mode, scheduled, notifSchedule }) => {
    const [movimientos, setMovimientos] = useState([])
    const [fileList, setFileList] = useState([])

    useEffect(() => {
        if(scheduled) setMovimientos(scheduled)
    }, [])

    const getTableColumns = () => {
        let columns = [
            {
                title: "Turno",
                dataIndex: "turn"
            },{
                title: "Hora / Correlativa",
                dataIndex: "corrHour"
            },{
                title: "Hora / Turno",
                dataIndex: "turnHour"
            },{
                title: "Unidad de Esfuerzo",
                dataIndex: "unit"
            },{
                title: "Movimientos Ejecución",
                dataIndex: "movs"
            },{
                title: "Total",
                dataIndex: "total"
            },{
                title: "Piezas montadas",
                dataIndex: "mounted"
            }
        ]

        return columns
    }

    const saveFaenaLocal = () => {
        if(movimientos.length === 0) {
          notification.error({
            message: 'Error',
            description: 'Debe agregar Movimientos Programados'
          })
        }else {
          saveFaena(movimientos)
        }
    }

    const prevStepLocal = () => {
        prevStep(movimientos)
    }

    const getPropsUpload = () => {
        return {
          accept: ".xlsx",
          onRemove: file => {
          },
          beforeUpload: async (file) => {
            const formData = new FormData()
            formData.append('file', file)
    
            let resp = await uploadSchedulePromise(formData)
            if(resp.status === 'OK') {
                setMovimientos(resp.sheduled)
                if(notifSchedule) notifSchedule(resp.sheduled)
                notification.success({
                    message: 'Programación',
                    description: 'Datos cargados exitosamente'
                })
            }else {
                notification.error({
                    message: 'Error',
                    description: resp.message
                })
            }
            return false
          },
          multiple: false,
          fileList
        }
    }

    return (
        <div className='step5'>
            { mode === "new" &&
                <Row>
                    A continuación ingrese los datos de Movimientos programados
                </Row>
            }
            { (mode === "new" || mode === "edit") &&
                <Row gutter={[16, 16]} style={{padding: 10}}>
                    <Col span={4} offset={8} style={{textAlign:'center'}}>
                        <Upload {...getPropsUpload()}>
                            <Button size="small">
                                <Icon type="upload" /> Cargar archivo
                            </Button>
                        </Upload>
                    </Col>
                    <Col span={4} style={{textAlign:'center'}}>
                        <Button type="link" href={apiConfig.url + '/../load/Programacion.xlsx'}>Descargar Plantilla</Button>
                    </Col>
                </Row>
            }
            <Row>
                <Table columns={ getTableColumns() } dataSource={ movimientos } size="small" pagination={movimientos.length > 10}/>
            </Row>
            { mode === "new" &&
                <Row className="tools">
                    <a onClick={prevStepLocal} className="prev-step"><Icon type="left" /></a>
                    <Button type="primary" onClick={saveFaenaLocal} className="save" icon="save">Grabar nueva Faena</Button>
                </Row>
            }
        </div>
    )
}

export default Step5;
