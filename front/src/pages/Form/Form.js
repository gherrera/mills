import "./Form.scss";
import React, { useEffect, useState, useContext } from "react";
import { withRouter } from "react-router-dom";
import { Spin, Row, Col, Form as FormAnt, Input, Button, Modal } from "antd";

import { FormDeclaration } from '../'
import { getFormByIdPromise, generateFormPromise } from "../Design/components/FormDetail/promises";
import { getFormHashPromise, getDestinatarioByRutPromise } from "../../promises";
import { sendFormPromise } from "../FormDeclaration/promises"; 
import { validateRutHelper } from "../FormDeclaration/helpers";

const Form = ({ match, form }) => {
    const { getFieldDecorator, validateFields, setFieldsValue } = form;
    const [isLoading, setIsloading] = useState(true);
    const [mode, setMode] = useState("html");
    const [frm, setFrm] = useState(null);
    const [ isVisibleDest, setIsVisibleDest ] = useState(false)
    const [ sentMessage, setSentMessage ] = useState(false)
    const [ sending, setSending ] = useState(false)

    useEffect(async () => {
        if(match.params.id) {
            loadForm(match.params.id)
            if (match.params.view === "pdf") {
                setMode("pdf");
            }
        }else if(match.params.hash) {
            setIsVisibleDest(true)
            let id = await getFormHashPromise(match.params.hash)
            if(id) {
                getFormByIdPromise(id).then(response => {
                    setFrm(response)
                    setIsloading(false);
                })
                setMode("preview");
            }else {
                setIsloading(false);
            }
        }
    }, [])

    const loadForm = (id) => {
        setIsloading(true);
        getFormByIdPromise(id).then(response => {
            setFrm(response)
            setIsloading(false);
        })
    }

    const generateForm = (e) => {
        e.preventDefault()

        validateFields(['rut','name', 'email']).then(async (obj) => {
            if(frm.cliente.pais !== 'CHI') obj.tipDoc = 'DNI'
            else obj.tipDoc = 'Rut'
            let fId = await generateFormPromise(frm.id, obj)
            //window.location = "../forms/"+fId
            loadForm(fId)
            setIsVisibleDest(false)
            setMode('html')
        })
    }

    const getValidator = (rule, value, callback, valType) => {
        if(value === null || value === '') callback()
        else {
          if(valType === 'rut' || valType === 'rutEmp' || valType === 'rutNat') {
            let type = ''
            value = value.replaceAll('.','').replaceAll('-','').trim()
            if(valType === 'rutEmp') type = 'Entity'
            else if(valType === 'rutNat') type = 'Person'
            if(frm.cliente.pais !== 'CHI' || validateRutHelper(value, type)) {
              callback()
            }else {
              if(valType === 'rut') {
                callback("Rut no válido");
              }else if(valType === 'rutEmp' && validateRutHelper(value)) {
                callback("Rut de Empresa no válido");
              }else if(valType === 'rutNat' && validateRutHelper(value)) {
                callback("Rut de Persona no válido");
              }else {
                callback("Rut no válido");
              }
            }
          }
        }
    }

    const verifyRut = async (rut) => {
        let dest = await getDestinatarioByRutPromise(frm.clientId, rut)
        if(dest && dest !== '') {
            setFieldsValue({name: dest.name, email: dest.email})
        }
    }

    const sendForm = (f) => {
        setSending(true)
        sendFormPromise(frm.id).then((response) => {
            setFrm(response)
            setSentMessage(true)
            setSending(false)
        })
    }

    const closeModalMessageHandler = () => {
        setSentMessage(false)
    }

    return (
        <div className={"formulario" + (isVisibleDest ? ' visible-dest':'') + (' mode-'+mode)}>
            {isLoading ? <Spin />
                :
                <>
                    <FormDeclaration form={frm} mode={mode} sendFormHandler={sendForm} sending={sending} />
                    { isVisibleDest &&
                        <div className="form-dest">
                            <FormAnt onSubmit={generateForm}>
                                <Row>
                                    <Col 
                                        xs={{ span: 22, offset: 1 }} 
                                        sm={{ span: 20, offset: 2 }} 
                                        md={{ span: 16, offset: 4 }} 
                                        lg={{ span: 12, offset: 6 }} 
                                        xl={{ span: 8, offset: 8 }} 
                                        className="form-data">
                                        <h3>Datos de Destinatario</h3>
                                        <FormAnt.Item label="Nro. de Documento de Identidad">
                                        { getFieldDecorator('rut', {
                                            validateTrigger: "onChange",
                                            rules:
                                                [
                                                    { required: true, message: 'Campo requerido' },
                                                    {validator: (rule, value, callback) => getValidator(rule, value, callback, 'rut')}
                                                ]
                                            })(
                                                <Input onBlur={(e) => verifyRut(e.target.value)}/>
                                            )
                                        }
                                        </FormAnt.Item>
                                        <FormAnt.Item label="Nombre">
                                        { getFieldDecorator('name', {
                                            validateTrigger: "onChange",
                                            rules:
                                                [
                                                    { required: true, message: 'Campo requerido' },
                                                ]
                                            })(
                                                <Input/>
                                            )
                                        }
                                        </FormAnt.Item>
                                        <FormAnt.Item label="Email">
                                        { getFieldDecorator('email', {
                                            validateTrigger: "onChange",
                                            rules:
                                                [
                                                    { required: true, message: 'Campo requerido' },
                                                    {type: "email", message: "Email no es válido"}
                                                ]
                                            })(
                                                <Input/>
                                            )
                                        }
                                        </FormAnt.Item>
                                        <Row>
                                            <Button type="primary" htmlType="submit">Generar</Button>
                                        </Row>
                                    </Col>
                                </Row>
                            </FormAnt>
                        </div>
                    }
                    { sentMessage &&
                        <Modal
                            visible={true}
                            footer={null}
                            onCancel={ closeModalMessageHandler }
                        >
                            <h3>La Declaración ha sido enviada exitosamente</h3>

                            <p>Se enviará un email con el comprobante de la declaración a {frm.dest.email}</p>
                        </Modal>
                    }
                    { sending &&
                        <div className="sending-overlay">
                            <Spin size="large" />
                        </div>
                    }
                </>
            }
        </div>
    )
}
export default FormAnt.create()(withRouter(Form));
