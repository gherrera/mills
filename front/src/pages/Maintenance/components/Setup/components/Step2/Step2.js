import './Step2.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, AutoComplete, Select, Row, Col, Form, Icon } from 'antd'
import { validateRutHelper } from '../../../../../../helpers'

const { Option } = AutoComplete;

const Step2 = ({form, client, faena, prevStep, nextStep, molinos }) => {
  const { getFieldDecorator, validateFields, getFieldsError, setFieldsValue } = form;
  const [faenas, setFaenas] = useState([])
  const [faenasSel, setFaenasSel] = useState([])
  const [faenaId, setFaenaId] = useState(faena.id)

  useEffect(() => {
    const uniqueFaenas = [];
    if(client.id) {
      molinos.map((item) => {
          var findItem = uniqueFaenas.find((x) => x.id === item.faena.id && item.faena.client.id === client.id);
          if (!findItem) uniqueFaenas.push(item.faena);
      });
    }
    setFaenas(uniqueFaenas)
    setFaenasSel(uniqueFaenas)
  }, [])

  const { t } = useTranslation()

  const prevStepLocal = () => {
    prevStep({ ...form.getFieldsValue(), id: faenaId})
  }

  const nextStepLocal = () => {
    validateFields(['faena','name','type','hours','ordenTrabajo']).then((f) => {
        nextStep({...f, id: faenaId})
    })
  }

  const onSelect = (value) => {
    setFaenaId(value)
    let fs = faenas.filter(f => f.id === value)[0]
    setFieldsValue({faena: fs.name})
  }

  const onSearch = (value) => {
      let fs = faenas.filter(f => f.name.toLowerCase().includes(value.toLowerCase()))
      setFaenasSel(fs)
      if(faenaId) {
          setFaenaId(null)
      }
  }
  const getValidator = (rule, value, callback, validation) => {
    if(value === null || value === '' || value === undefined) callback()
    else {
      if(validation.type === 'number' || validation.type === 'percent') {
        value = value.replaceAll(',','.')
        let re = new RegExp('^\\s*(\\d+(\\.\\d{0,' + (validation.decimals ? validation.decimals : 0) + '})?)\\s*$')
        if(re.test(value)) {
          if(validation.type === 'percent' && parseFloat(value) > 100) {
            callback("Numero no puede ser mayor a 100");
          }else {
            callback()
          }
        }else {
          var ren = new RegExp('^\\s*(\\d+(\\.\\d{0,100})?)\\s*$')
          if(validation.decimals === 0 && ren.test(value)) {
            callback("Numero no permite decimales");
          }else {
            callback("Numero no válido");
          }
        }
      }else if(validation.type === 'rut' || validation.type === 'rutEmp' || validation.type === 'rutNat') {
        let type = ''
        if(validation.type === 'rutEmp') type = 'Entity'
        else if(validation.type === 'rutNat') type = 'Person'
        if(validateRutHelper(value, type)) {
          callback()
        }else {
          if(validation.type === 'rut') {
            callback("Rut no válido");
          }else if(validation.type === 'rutEmp' && validateRutHelper(value)) {
            callback("Rut de Empresa no válido");
          }else if(validation.type === 'rutNat' && validateRutHelper(value)) {
            callback("Rut de Persona no válido");
          }else {
            callback("Rut no válido");
          }
        }
      }
    }
  }

  return (
    <div className='step2'>
        <Row>
            A continuación ingrese los datos de la Faena
        </Row>
        <Row gutter={12}>
            <Form>
                <Col span={12}>
                    <Form.Item>
                        { getFieldDecorator('faena', {
                            initialValue: faena.faena,
                            rules: [{
                                required: true,
                                message: 'Ingrese Nombre de Faena'
                            }]
                        })(
                          <AutoComplete
                              dataSource={faenasSel.map(cli => 
                                <Option key={cli.id} value={cli.id}>
                                  {cli.name}
                                </Option>
                              )}
                              //style={{ width: 200 }}
                              onSelect={onSelect}
                              onSearch={onSearch}
                              placeholder="Faena"
                          />
                        )}
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item >
                        { getFieldDecorator('ordenTrabajo', {
                            initialValue: faena.ordenTrabajo,
                            rules: [{
                                required: true,
                                message: 'Ingrese Orden de trabajo'
                            }]
                        })(
                            <Input
                                placeholder="Orden de trabajo"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item >
                        { getFieldDecorator('name', {
                            initialValue: faena.name,
                            rules: [{
                                required: true,
                                message: 'Ingrese Nombre del molino'
                            }]
                        })(
                            <Input
                                placeholder="Nombre del molino"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item >
                        { getFieldDecorator('type', {
                            initialValue: faena.type,
                            rules: [{
                                required: true,
                                message: 'Ingrese Tipo de equipo'
                            }]
                        })(
                            <Input
                                placeholder="Tipo de equipo"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item >
                        { getFieldDecorator('hours', {
                            initialValue: faena.hours,
                            rules: [{
                                    required: true,
                                    message: 'Ingrese Estimado de tiempo de trabajo(horas)'
                                },
                                {
                                    validator: (rule, value, callback) => getValidator(rule, value, callback, {type: 'number', decimals: 0})
                                }
                            ]
                        })(
                            <Input
                                placeholder="Estimado de tiempo de trabajo(horas)"
                            />
                        )}
                    </Form.Item>
                </Col>
            </Form>
        </Row>
        <Row className="tools">
            <a onClick={prevStepLocal} className="prev-step"><Icon type="left" /></a>
            <a onClick={nextStepLocal} className="next-step"><Icon type="right" /></a>
        </Row>
    </div>
  )
}

export default Form.create()(Step2);
