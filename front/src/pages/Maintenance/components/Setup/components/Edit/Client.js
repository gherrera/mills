import './Client.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Row, Col, Form, Icon } from 'antd'
import moment from 'moment';

const Client = ({form, client, action, readOnly, changeCliente }) => {
  const { getFieldDecorator, validateFields, getFieldsError, setFieldsValue } = form;
  const [mode, setMode] = useState('view')

  useEffect(() => {

  }, [])

  const formItemLayout =
        {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        }

  const formItemLayout1 =
    {
        labelCol: { span: 10 },
        wrapperCol: { span: 14 },
    }

  const changeField = () => {
    validateFields(['name','rut','address','contactName','contactPhone','email']).then((c) => {
        changeCliente(c)
    })
  }

  return (
    <div className='client'>
        <span className="title">Datos del cliente</span>
        <Form layout="horizontal">
            <Row className="fields" gutter={12}>
                <Col span={14}>
                    <Form.Item label="Razón social" {...formItemLayout}>
                        { getFieldDecorator('name', {
                            initialValue: client.name,
                            rules: [{
                                required: !readOnly,
                                message: 'Ingrese Razón social'
                            }]
                        })(
                            <Input placeholder="Razón social" readOnly={readOnly} />
                        )}
                    </Form.Item>
                    
                </Col>
                <Col span={10}>
                    <Form.Item label="Nro de identificación" {...formItemLayout1}>
                        { getFieldDecorator('rut', {
                            initialValue: client.rut,
                            rules: [{
                                required: !readOnly,
                                message: 'Ingrese Razón social'
                            }]
                        })(
                            <Input placeholder="Nro de identificación" readOnly={readOnly} onChange={changeField} />
                        )}
                    </Form.Item>
                </Col>
                <Col span={14}>
                    <Form.Item label="Dirección" {...formItemLayout}>
                        { getFieldDecorator('address', {
                            initialValue: client.address,
                            rules: [{
                                required: !readOnly,
                                message: 'Dirección'
                            }]
                        })(
                            <Input placeholder="Dirección" readOnly={readOnly}  />
                        )}
                    </Form.Item>
                </Col>
                <Col span={10}>
                    <Form.Item label="Correo electrónico de contacto" {...formItemLayout1}>
                        { getFieldDecorator('email', {
                            initialValue: client.email,
                            rules: [{
                                    required: !readOnly,
                                    message: 'Correo electrónico de contacto'
                                },
                                {type: "email", message: "Email no es válido"}
                            ]
                        })(
                            <Input placeholder="Correo electrónico de contacto" readOnly={readOnly} onChange={changeField} />
                        )}
                    </Form.Item>
                </Col>
                <Col span={14}>
                    <Form.Item label="Persona de Contacto" {...formItemLayout}>
                        { getFieldDecorator('contactName', {
                            initialValue: client.contactName,
                            rules: [{
                                required: !readOnly,
                                message: 'Persona de Contacto'
                            }]
                        })(
                            <Input placeholder="Persona de Contacto" readOnly={readOnly} onChange={changeField} />
                        )}
                    </Form.Item>
                </Col>
                <Col span={10}>
                    <Form.Item label="Teléfono de Contacto" {...formItemLayout1}>
                        { getFieldDecorator('contactPhone', {
                            initialValue: client.contactPhone,
                            rules: [{
                                required: !readOnly,
                                message: 'Teléfono de Contacto'
                            }]
                        })(
                            <Input placeholder="Teléfono de Contacto" readOnly={readOnly} onChange={changeField} />
                        )}
                    </Form.Item>
                </Col>
                
            </Row>
        </Form>
    </div>
  )
}

export default Form.create({
    name: 'form-client',
    onFieldsChange(props, changedFields) {
        debugger
        //props.onChange(changedFields);
    },
    onValuesChange(props, values) {
        debugger
        const { getFieldDecorator, validateFields, getFieldsError, setFieldsValue } = props.form;
        validateFields(['name','rut','address','contactName','contactPhone','email']).then((c) => {
            props.changeCliente(c)
        })
    },
})(Client);
