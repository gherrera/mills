import './Edit.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Row, Col, Form, Icon } from 'antd'
import moment from 'moment';

const Edit = ({form, molino, action }) => {
  const { getFieldDecorator, validateFields, getFieldsError, setFieldsValue } = form;
  const [mode, setMode] = useState('view')
  const [readOnly, setReadOnly] = useState(true)

  useEffect(() => {

  }, [])

  return (
    <div className='edit'>
        <Row className="section">
            <span className="title">Datos del cliente</span>
            <Form>
                <Row className="fields" gutter={12}>
                    <Col span={17}>
                        <Form.Item label="Razón social">
                            { getFieldDecorator('name', {
                                initialValue: molino.faena.client.name,
                                rules: [{
                                    required: !readOnly,
                                    message: 'Ingrese Razón social'
                                }]
                            })(
                                <Input placeholder="Razón social" readOnly />
                            )}
                        </Form.Item>
                        
                    </Col>
                    <Col span={7}>
                        <Form.Item label="Nro de identificación">
                            { getFieldDecorator('rut', {
                                initialValue: molino.faena.client.rut,
                                rules: [{
                                    required: !readOnly,
                                    message: 'Ingrese Razón social'
                                }]
                            })(
                                <Input placeholder="Nro de identificación" readOnly />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Dirección">
                            { getFieldDecorator('address', {
                                initialValue: molino.faena.client.address,
                                rules: [{
                                    required: !readOnly,
                                    message: 'Dirección'
                                }]
                            })(
                                <Input placeholder="Dirección" readOnly />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={17}>
                        <Form.Item label="Persona de Contacto">
                            { getFieldDecorator('contactName', {
                                initialValue: molino.faena.client.contactName,
                                rules: [{
                                    required: !readOnly,
                                    message: 'Persona de Contacto'
                                }]
                            })(
                                <Input placeholder="Persona de Contacto" readOnly />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={7}>
                        <Form.Item label="Teléfono de Contacto">
                            { getFieldDecorator('contactPhone', {
                                initialValue: molino.faena.client.contactPhone,
                                rules: [{
                                    required: !readOnly,
                                    message: 'Teléfono de Contacto'
                                }]
                            })(
                                <Input placeholder="Teléfono de Contacto" readOnly />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Correo electrónico de contacto">
                            { getFieldDecorator('email', {
                                initialValue: molino.faena.client.email,
                                rules: [{
                                    required: !readOnly,
                                    message: 'Correo electrónico de contacto'
                                }]
                            })(
                                <Input placeholder="Correo electrónico de contacto" readOnly />
                            )}
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Row>
    </div>
  )
}

export default Form.create()(Edit);
