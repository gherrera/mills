import './Faena.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Row, Col, Form, Select } from 'antd'

const Faena = ({form, molino, action, readOnly, initFormFaena, mode }) => {
  const { getFieldDecorator, validateFields, getFieldsError, setFieldsValue } = form;
  const [ showAll, setShowAll ] = useState(action !== 'STARTED' && action !== 'FINISHED')

  useEffect(() => {
    initFormFaena(form)
  }, [])

  const formItemLayout =
        {
            labelCol: { span: 9},
            wrapperCol: { span: 15 },
        }

  const formItemLayout1 =
    {
        labelCol: { span: 9 },
        wrapperCol: { span: 15 },
    }

  const changeField = () => {
    /*validateFields(['faena','name','type','hours','ordenTrabajo']).then((f) => {
        changeFaena(f)
    })*/
  }

  const toogleShowAll = () => {
    setShowAll(!showAll)
  }

  return (
    <div className='faena'>
        <Row className="title">
            <Col span={18}>Datos de la Faena</Col>
            {(action === 'STARTED' || action === 'FINISHED') &&
                <Col span={6} className="ver-mas" onClick={toogleShowAll}>
                    <a>{showAll? "Ver menos" : "Ver más"}</a>
                </Col>
            }
        </Row>
        <Form layout="horizontal">
            <Row className="fields" gutter={12}>
                <Col span={8}>
                    <Form.Item label="División o Faena" {...formItemLayout}>
                        { getFieldDecorator('faena', {
                            initialValue: molino.faena.name,
                            rules: [{
                                required: !readOnly,
                                message: 'Ingrese División o Faena'
                            }]
                        })(
                            <Input placeholder="División o Faena" readOnly={readOnly} onChange={changeField} />
                        )}
                    </Form.Item>
                    
                </Col>
                <Col span={8}>
                    <Form.Item label="Orden de Trabajo" {...formItemLayout}>
                        { getFieldDecorator('ordenTrabajo', {
                            initialValue: molino.ordenTrabajo,
                            rules: [{
                                required: !readOnly,
                                message: 'Ingrese Orden de Trabajo'
                            }]
                        })(
                            <Input placeholder="Orden de Trabajo" readOnly={readOnly} onChange={changeField}  />
                        )}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Tiempo estimado (horas)" {...formItemLayout}>
                        { getFieldDecorator('hours', {
                            initialValue: molino.hours,
                            rules: [{
                                required: !readOnly,
                                message: 'Ingrese Estimado de tiempo de trabajo (horas)'
                            }]
                        })(
                            <Input placeholder="Estimado de tiempo de trabajo (horas)" readOnly={readOnly} onChange={changeField} />
                        )}
                    </Form.Item>
                </Col>
                { showAll &&
                <>
                    <Col span={8}>
                        <Form.Item label="Tipo de equipo" {...formItemLayout}>
                            { getFieldDecorator('type', {
                                initialValue: molino.type,
                                rules: [{
                                    required: !readOnly,
                                    message: 'Seleccione Tipo de equipo'
                                }]
                            })(
                                <Select placeholder="Tipo de equipo"  readOnly={readOnly} onChange={changeField}>
                                <Select.Option value="Molino SAG">Molino SAG</Select.Option>
                                <Select.Option value="Molino Bolas">Molino Bolas</Select.Option>
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Nombre de equipo" {...formItemLayout}>
                            { getFieldDecorator('name', {
                                initialValue: molino.name,
                                rules: [{
                                        required: !readOnly,
                                        message: 'Ingrese Nombre de equipo'
                                    },
                                ]
                            })(
                                <Input placeholder="Nombre de equipo" readOnly={readOnly} onChange={changeField} />
                            )}
                        </Form.Item>
                    </Col>
                </>
                }
            </Row>
        </Form>
    </div>
  )
}

export default Form.create()(Faena);
