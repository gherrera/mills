import './Step1.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, AutoComplete, Row, Col, Form, Icon } from 'antd'

const { Option } = AutoComplete;


const Step1 = ({form, client, nextStep, molinos }) => {
  const { getFieldDecorator, validateFields, getFieldsError, setFieldsValue } = form;
  const [clientes, setClientes] = useState([])
  const [clientesSel, setClientesSel] = useState([])
  const [clienteId, setClienteId] = useState(client.id)

  useEffect(() => {
    const uniqueClientes = [];
    molinos.map((item) => {
        var findItem = uniqueClientes.find((x) => x.id === item.faena.client.id);
        if (!findItem) uniqueClientes.push(item.faena.client);
    });
    setClientesSel(uniqueClientes)
    setClientes(uniqueClientes)
  }, [molinos])

  const { t } = useTranslation()

  const nextStepLocal = () => {
    validateFields(['name','rut','address','contactName','contactPhone','email']).then((c) => {
        nextStep({ ...c, id: clienteId })
    })
  }

  const onSelect = (value) => {
    setClienteId(value)
    let cli = clientes.filter(c => c.id === value)[0]
    setFieldsValue({name: cli.name, rut: cli.rut, address: cli.address, contactName: cli.contactName, contactPhone: cli.contactPhone, email: cli.email})
  }

  const onSearch = (value) => {
      let cli = clientes.filter(c => c.name.toLowerCase().includes(value.toLowerCase()))
      setClientesSel(cli)
      if(clienteId) {
          setFieldsValue({rut: null, address: null, contactName: null, contactPhone: null, email: null})
          setClienteId(null)
      }
  }

  return (
    <div className='step1'>
        <Row>
            A continuación ingrese los datos del Cliente
        </Row>
        <Row gutter={12}>
            <Form>
                <Col span={18}>
                    <Form.Item>
                        { getFieldDecorator('name', {
                            initialValue: client.name,
                            rules: [{
                                required: true,
                                message: 'Ingrese Razón social'
                            }]
                        })(
                            <AutoComplete
                                dataSource={clientesSel.map(cli => 
                                  <Option key={cli.id} value={cli.id}>
                                    {cli.name}
                                  </Option>
                                )}
                                //style={{ width: 200 }}
                                onSelect={onSelect}
                                onSearch={onSearch}
                                placeholder="Razón social"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item >
                        { getFieldDecorator('rut', {
                            initialValue: client.rut,
                            rules: [{
                                required: true,
                                message: 'Ingrese Nro de identificación'
                            }]
                        })(
                            <Input
                                placeholder="Nro de identificación"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item >
                        { getFieldDecorator('address', {
                            initialValue: client.address,
                            rules: [{
                                required: true,
                                message: 'Ingrese Dirección'
                            }]
                        })(
                            <Input
                                placeholder="Dirección"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={18}>
                    <Form.Item >
                        { getFieldDecorator('contactName', {
                            initialValue: client.contactName,
                            rules: [{
                                required: true,
                                message: 'Ingrese Persona de contacto'
                            }]
                        })(
                            <Input
                                placeholder="Persona de contacto"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item >
                        { getFieldDecorator('contactPhone', {
                            initialValue: client.contactPhone,
                            rules: [{
                                required: true,
                                message: 'Ingrese Teléfono de contacto'
                            }]
                        })(
                            <Input
                                placeholder="Teléfono de contacto"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item >
                        { getFieldDecorator('email', {
                            initialValue: client.email,
                            rules: [{
                                    required: true,
                                    message: 'Ingrese Correo electrónico'
                                },
                                {type: "email", message: "Email no es válido"}
                            ]
                        })(
                            <Input
                                placeholder="Correo electrónico de contacto"
                            />
                        )}
                    </Form.Item>
                </Col>
            </Form>
        </Row>
        <Row className="tools">
            <a onClick={nextStepLocal} className="next-step"><Icon type="right" /></a>
        </Row>
    </div>
  )
}

export default Form.create()(Step1);
