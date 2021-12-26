import "./FormDetail.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Button,
  Modal,
  Select,
  Drawer,
  Input,
  Table
} from "antd";
import { camelizerHelper } from "../../../../helpers";
import { ModalPdfViewer } from "..";

import { useTranslation } from "react-i18next";
import moment from "moment";
import { getFormByIdPromise, addCommentPromise, addStatusPromise } from "../../promises";
import { ReportService } from "../../../../services";

const { TextArea } = Input;

const FormDetail = ({ form, closeHandler }) => {
    const [frm, setFrm] = useState({})
    const [ showPdf, setShowPdf ] = useState(false)
    const [ comments, setComments ] = useState(null)
    const [ status, setStatus ] = useState(null)
    const [ statusChanged, setStatusChanged ] = useState(false)
    const [ isVisibleHistoryStatus, setIsVisibleHistoryStatus ] = useState(false)
    const [ isVisibleHistoryComment, setIsVisibleHistoryComment ] = useState(false)
    const [ isVisibleForms, setIsVisibleForms ] = useState(false)

    useEffect(() => {
        loadForm()
    }, [])

    const loadForm = () => {
        getFormByIdPromise(form.id).then((response) => {
            setFrm(response)
            response.actualState && setStatus(response.actualState.status)
        })
    }

    const getTypeDest = (type) => {
        if(type === 'PN') return 'Natural'
        else return 'Jurídica'
    }

    const handleViewForm = () => {
        setShowPdf(true)
    }
        
    const closeHandlerPDF = () => {
        setShowPdf(false)
    }

    const handleAddComment = () => {
        if(comments) {
            addCommentPromise(form.id, comments).then((response) => {
                loadForm()
                setComments(null)
            })
        }
    }

    const handleViewForms = () => {
        setIsVisibleForms(true)
    }

    const handleChangleComments = (e) => {
        setComments(e.target.value)
    }

    const handleChangleStatus = (value) => {
        setStatus(value)
        setStatusChanged(true)
    }

    const handleSaveStatus = () => {
        addStatusPromise(form.id, status).then((response) => {
            loadForm()
            setStatusChanged(false)
        })
    }

    const closeModalComments = () => {
        setIsVisibleHistoryComment(false)
    }

    const closeModalStatus = () => {
        setIsVisibleHistoryStatus(false)
    }

    const closeModalForms = () => {
        setIsVisibleForms(false)
    }

    const columnsComment = [
        {
            title: 'Comentario',
            dataIndex: 'comment',
            width: '60%'
        },
        {
            title: 'Autor',
            dataIndex: 'autor',
            width: '20%'
        },
        {
            title: 'Fecha',
            dataIndex: 'date',
            width: '20%',
            render: (text, record) => moment(text).format('DD.MM.YYYY HH:mm')
        }
    ]

    const columnsStatus = [
        {
            title: 'Estado',
            dataIndex: 'status',
            width: '30%',
            render: (text) => {
                if(text === 'RECIBIDO') return 'Recibido'
                else if(text === 'PENDIENTE') return 'Pendiente'
                else if(text === 'EVALUACION') return 'En Evaluación'
                else if(text === 'CERRADO') return 'Cerrado'
            }
        },
        {
            title: 'Autor',
            dataIndex: 'autor',
            width: '35%'
        },
        {
            title: 'Fecha',
            dataIndex: 'date',
            width: '35%',
            render: (text, record) => moment(text).format('DD.MM.YYYY HH:mm')
        }
    ]

    const columnsForms = [
        {
            title: 'Formulario',
            dataIndex: 'name',
            width: '50%'
        },
        {
            title: 'Folio',
            dataIndex: 'folio',
            width: '20%'
        },
        {   
            title: 'Fecha',
            dataIndex: 'sendDate',
            width: '20%',
            render: (text, record) => moment(text).format('DD.MM.YYYY HH:mm')
        },
        {   
            title: 'Ver',
            dataIndex: 'id',
            width: '20%',
            render: (text, record) => {
                return <>
                    <Button size="small" icon="file-pdf" onClick={() => handleViewForm(record)}/>
                    <Button size="small" icon="file-text" onClick={() => downloadJson(record)}/>
                </>
            }
        }
    ]

    const downloadJson = () => {
        ReportService.read('/getJsonFormId/'+form.id, null, null, 'form-'+form.folio+'.json')
    }

    return (
        <div>
            <Drawer
                className="manage-form-detail"
                title="Detalle del Formulario"
                placement="right"
                closable={true}
                visible={true}
                width={1300}
                onClose={closeHandler}
            >
                <Row className="block">
                    <h3>{form.name}</h3>
                    <Row>
                        <Col span={6}>Categoría: <span className="data-value">{camelizerHelper(form.category)}</span></Col>
                        <Col span={6}>Folio: <span className="data-value">{form.folio}</span></Col>
                    </Row>
                </Row>
                <Row className="block">
                    { form.dest ?
                        <>
                            <h3>{form.dest.name}</h3>
                            <Row>
                                <Col span={6}>Tipo de Documento: <span className="data-value">{form.dest.tipDoc?form.dest.tipDoc:'-'}</span></Col>
                                <Col span={6}>Nro de Documento: <span className="data-value">{form.dest.rut}</span></Col>
                                <Col span={6}>Tipo de Persona: <span className="data-value">{form.dest.type?getTypeDest(form.dest.type):'-'}</span></Col>
                                <Col span={6}>Correo: <span className="data-value">{form.dest.email}</span></Col>
                                <Col span={6}>Empresa: <span className="data-value">{form.dest.empresa}</span></Col>
                                <Col span={6}>Gerencia: <span className="data-value">{form.dest.gerencia}</span></Col>
                                <Col span={6}>Area: <span className="data-value">{form.dest.area}</span></Col>
                            </Row>
                        </>
                        :
                    <Col><h2>Destinatario eliminado</h2></Col>
                    }
                </Row>
                <Row className="block">
                    <h3>Recibido el: {moment(form.sendDate).format('DD.MM.YYYY HH:mm')}</h3>
                    <Row>
                        <Col className="btns">
                            <Button size="small" type="primary" onClick={handleViewForm}>Ver Formulario</Button>
                            <Button size="small" type="primary" onClick={downloadJson}>Descargar Información</Button>
                            <Button size="small" type="primary" onClick={handleViewForms}>Ver todos los formularios</Button>
                        </Col>
                    </Row>
                </Row>
                <Row className="block">
                    <h3>Asignar Estado</h3>
                    <Row>
                        <Col span={2}>Estado</Col>
                        <Col span={3}>
                            <Select size="small" value={status} style={{width:'80%'}} onChange={handleChangleStatus}>
                                <Select.Option value="RECIBIDO">Recibido</Select.Option>
                                <Select.Option value="PENDIENTE">Pendiente</Select.Option>
                                <Select.Option value="EVALUACION">En Evaluación</Select.Option>
                                <Select.Option value="CERRADO">Cerrado</Select.Option>
                            </Select>
                            &nbsp;
                            <Button size="small" icon="save" disabled={!statusChanged} onClick={handleSaveStatus}/>
                        </Col>
                        <Col span={6} offset={1}>Fecha: <span className="data-value">{frm.actualState ? moment(frm.actualState.date).format('DD.MM.YYYY'):null}</span></Col>
                        <Col span={6}>
                            Ver Historico&nbsp;&nbsp;
                            <Button icon="folder-open" size="small" onClick={() => setIsVisibleHistoryStatus(true)}/>
                        </Col>
                    </Row>
                </Row>
                <Row className="block">
                    <h3>Comentarios</h3>
                    <Row>
                        <Col span={1}>
                            <Button icon="plus" type="primary" onClick={handleAddComment} disabled={comments===null}/>
                        </Col>
                        <Col span={23}>
                            <TextArea rows={3} placeholder="Agregar comentarios" value={comments} onChange={handleChangleComments}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={23} offset={1}>
                            <Col>Ultimo Comentario</Col>
                            <Col span={18}>
                                <TextArea rows={3} value={frm.lastComment && frm.lastComment.comment} readOnly/>
                            </Col>
                            <Col span={5} offset={1}>
                                <Row>Agregado por: <span className="data-value">{frm.lastComment && frm.lastComment.autor}</span></Row>
                                <Row>Fecha: <span className="data-value">{frm.lastComment && moment(frm.lastComment.date).format('DD.MM.YYYY')}</span></Row>
                                <Row>Ver Histórico: <Button icon="folder-open" size="small" onClick={() => setIsVisibleHistoryComment(true)}/></Row>
                            </Col>
                        </Col>
                    </Row>
                </Row>
            </Drawer>
            { showPdf &&
                <Modal
                    className="modal-pdf-viewer"
                    visible={true}
                    title="Declaración"
                    width = {1200}
                    style={{ top: 10 }}
                    header={ null }
                    footer= { [<Button key="back" onClick={ closeHandlerPDF }>Cerrar</Button>] }
                    onCancel={ closeHandlerPDF }
                >
                    <ModalPdfViewer pdfId={form.id} />
                </Modal>          
            }
            { isVisibleHistoryComment &&
                <Modal
                    visible={true}
                    title="Comentarios"
                    header={ null }
                    width={800}
                    footer= { [<Button key="back" onClick={ closeModalComments }>Cerrar</Button>] }
                    onCancel={ closeModalComments }
                >
                    <Table size="small" dataSource={frm.comments} columns={columnsComment} />
                </Modal>
            }
            { isVisibleHistoryStatus &&
                <Modal
                    visible={true}
                    title="Estados"
                    header={ null }
                    footer= { [<Button key="back" onClick={ closeModalStatus }>Cerrar</Button>] }
                    onCancel={ closeModalStatus }
                >
                    <Table size="small" dataSource={frm.statuses} columns={columnsStatus} />
                </Modal>
            }
            {isVisibleForms &&
                <Modal
                    visible={true}
                    title="Formularios"
                    header={ null }
                    width={800}
                    footer= { [<Button key="back" onClick={ closeModalForms }>Cerrar</Button>] }
                    onCancel={ closeModalForms }
                >
                    <Table size="small" dataSource={frm.dest.forms} columns={columnsForms} />
                </Modal>
            }
        </div>
    )
}

export default FormDetail;
