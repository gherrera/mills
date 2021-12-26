import "./RecipientDetail.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Button,
  Modal,
  Select,
  Drawer,
  Input,
  Table,
  Form,
  notification
} from "antd";
import { camelizerHelper } from "../../../../helpers";

import { useTranslation } from "react-i18next";
import moment from "moment";
import { getRecipientByIdPromise, addCommentPromise, updateRecipientPromise } from "../../promises";
import { ReportService } from "../../../../services";
import { ModalPdfViewer } from "../../../Manage/components";

const { TextArea } = Input;

const RecipientDetail = ({ form, recipient, closeHandler }) => {
    const { getFieldDecorator, validateFields, getFieldsError, setFieldsValue } = form;
    const [ recpt, setRecpt ] = useState({})
    const [ comments, setComments ] = useState(null)
    const [ pdfId, setPdfId ] = useState(null)
    const [ isVisibleHistoryComment, setIsVisibleHistoryComment ] = useState(false)
    const [ enableSave, setEnableSave ] = useState(false)

    useEffect(() => {
        loadRecipient()
    }, [])

    const loadRecipient = () => {
        getRecipientByIdPromise(recipient.id).then((response) => {
            setRecpt(response)
        })
    }

    const handleChangeValue = (key, value) => {
        setEnableSave(true)
    }

    const handleAddComment = () => {
        if(comments) {
            addCommentPromise(recipient.id, comments).then((response) => {
                loadRecipient()
                setComments(null)
            })
        }
    }

    const handleChangleComments = (e) => {
        setComments(e.target.value)
    }

    const closeModalComments = () => {
        setIsVisibleHistoryComment(false)
    }

    const handleViewForm = (f) => {
        setPdfId(f.id)
    }
        
    const closeHandlerPDF = () => {
        setPdfId(null)
    }

    const downloadJson = (form) => {
        ReportService.read('/getJsonFormId/'+form.id, null, null, 'form-'+form.folio+'.json')
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

    const columnsForm = [
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

    const handleSaveRecipient = () => {
        let errors = getFieldsError()
        let errs = Object.keys(errors).filter(f => errors[f])
        if(errs.length > 0) {
            notification.error({
                message: 'Hay errores en los datos',
                description: errs.map(e => errors[e])
            })
        }else {
            validateFields(['type','email','empresa','gerencia','area']).then((obj) => {
                updateRecipientPromise({...recipient, ...obj}).then((response) => {
                    if(response === 'OK') {
                        notification.success({
                            message: 'Datos guardados correctamente'
                        })
                    }else {
                        notification.error({
                            message: 'Se ha producido un error'
                        })
                    }
                })
                setEnableSave(false)
            })
        }
    }

    return (
        <div>
            <Drawer
                className="recipient-detail"
                title="Detalle Destinatario"
                placement="right"
                closable={true}
                visible={true}
                width={1300}
                onClose={closeHandler}
            >
                <Row className="block">
                    <h3>{recipient.name}</h3>
                    <Row gutter={8}>
                        <Col span={6} className="field">
                            <Col span={11}>Tipo de Documento:</Col>
                            <Col span={13}>
                                <span className="data-value">{recipient.tipDoc?recipient.tipDoc:'-'}</span>
                            </Col>
                        </Col>
                        <Col span={6} className="field">
                            <Col span={10}>Nro de Documento:</Col>
                            <Col span={14}>
                                <span className="data-value">{recipient.rut}</span>
                            </Col>
                        </Col>
                        <Col span={6} className="field">
                            <Col span={9}>Tipo de Persona:</Col>
                            <Col span={15}>
                                { getFieldDecorator('type', {
                                    initialValue: recpt.type,
                                    validateTrigger: "onChange"
                                    })(
                                        <Select size="small" 
                                            style={{width: '90%'}} 
                                            className="input-value" 
                                            onChange={(value) => handleChangeValue('type', value)}
                                            autoComplete="off"
                                        >
                                            <Select.Option value="PN">Persona Natural</Select.Option>
                                            <Select.Option value="PJ">Persona Jurídica</Select.Option>
                                        </Select>
                                    )
                                }
                            </Col>
                        </Col>
                        <Col span={6} className="field">
                            <Col span={6}>Correo:</Col>
                            <Col span={18}>
                                { getFieldDecorator('email', {
                                    initialValue: recpt.email,
                                    validateTrigger: "onChange",
                                    rules:
                                        [{type: "email", message: "Email no es válido"}]
                                    })(
                                        <Input size="small" 
                                            style={{width: '90%'}} 
                                            className="input-value" 
                                            onChange={(e) => handleChangeValue('email', e.target.value)}
                                            autoComplete="off"
                                        />
                                    )
                                }
                            </Col>
                        </Col>
                        <Col span={6} className="field">
                            <Col span={11}>Empresa:</Col>
                            <Col span={13}>
                                { getFieldDecorator('empresa', {
                                    initialValue: recpt.empresa,
                                    validateTrigger: "onChange"
                                    })(
                                        <Input size="small" 
                                            style={{width: '90%'}} 
                                            className="input-value" 
                                            onChange={(e) => handleChangeValue('empresa', e.target.value)}
                                            autoComplete="off"
                                        />
                                    )
                                }
                            </Col>
                        </Col>
                        <Col span={6} className="field">
                            <Col span={10}>Gerencia:</Col>
                            <Col span={14}>
                                { getFieldDecorator('gerencia', {
                                    initialValue: recpt.gerencia,
                                    validateTrigger: "onChange"
                                    })(
                                        <Input size="small" 
                                            style={{width: '90%'}} 
                                            className="input-value" 
                                            onChange={(e) => handleChangeValue('gerencia', e.target.value)}
                                            autoComplete="off"
                                        />
                                    )
                                }
                            </Col>
                        </Col>
                        <Col span={6} className="field">
                            <Col span={9}>Area:</Col>
                            <Col span={15}>
                                { getFieldDecorator('area', {
                                    initialValue: recpt.area,
                                    validateTrigger: "onChange"
                                    })(
                                        <Input size="small" 
                                            style={{width: '90%'}} 
                                            className="input-value" 
                                            onChange={(e) => handleChangeValue('area', e.target.value)}
                                            autoComplete="off"
                                        />
                                    )
                                }
                            </Col>
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
                                <TextArea rows={3} value={recpt.lastComment && recpt.lastComment.comment} readOnly/>
                            </Col>
                            <Col span={5} offset={1}>
                                <Row>Agregado por: <span className="data-value">{recpt.lastComment && recpt.lastComment.autor}</span></Row>
                                <Row>Fecha: <span className="data-value">{recpt.lastComment && moment(recpt.lastComment.date).format('DD.MM.YYYY')}</span></Row>
                                <Row>Ver Histórico: <Button icon="folder-open" size="small" onClick={() => setIsVisibleHistoryComment(true)}/></Row>
                            </Col>
                        </Col>
                    </Row>
                </Row>
                <Row className="block">
                    <h3>Historial</h3>
                    <Row>
                        <Table size="small" dataSource={recpt.forms} columns={columnsForm} pagination={{pageSize: 5}}/>
                    </Row>
                </Row>
                <div
                    style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    borderTop: '1px solid #e8e8e8',
                    padding: '10px 16px',
                    textAlign: 'right',
                    left: 0,
                    background: '#fff',
                    borderRadius: '0 0 4px 4px',
                    }}
                >
                    <Button
                        style={{
                            marginRight: 8,
                        }}
                        onClick={closeHandler}
                    >
                        Cerrar
                    </Button>
                    <Button onClick={handleSaveRecipient} type="primary" disabled={!enableSave}>
                        Guardar
                    </Button>
                </div>
            </Drawer>
            { isVisibleHistoryComment &&
                <Modal
                    visible={true}
                    title="Comentarios"
                    header={ null }
                    width={800}
                    footer= { [<Button key="back" onClick={ closeModalComments }>Cerrar</Button>] }
                    onCancel={ closeModalComments }
                >
                    <Table size="small" dataSource={recpt.comments} columns={columnsComment} />
                </Modal>
            }
            { pdfId &&
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
                    <ModalPdfViewer pdfId={pdfId} />
                </Modal>          
            }
        </div>
    )
}

export default Form.create()(RecipientDetail);
