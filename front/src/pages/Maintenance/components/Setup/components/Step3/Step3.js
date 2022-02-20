import './Step3.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Button, Row, Col, Form, Icon, Table, notification} from 'antd'
import { validateRutHelper } from '../../../../../../helpers'

const Step3 = ({form, pieces, prevStep, nextStep }) => {
  const { getFieldDecorator, validateFields, setFieldsValue } = form;
  const [piezas, setPiezas] = useState([])

  useEffect(() => {
    if(pieces) setPiezas(pieces)
    
  }, [])

  const { t } = useTranslation()

  const prevStepLocal = () => {
    prevStep(piezas)
  }

  const nextStepLocal = () => {
    if(piezas.length > 0) {
      nextStep(piezas)
    }else {
      notification.error({
        message: 'Error',
        description: 'Debe agregar al menos una pieza'
      })
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

  const addPieza = () => {
    validateFields(['type','name','qty']).then((p) => {
      let ps = [...piezas, {type: p.type, name: p.name, qty: parseInt(p.qty, 10)}]
      setPiezas(ps)
      setFieldsValue({type: null, name: null, qty: null})
    })
  }

  const tableColumns = [
    {
      title: "Sección",
      dataIndex: "type",
      width: "31%",
      sorter: (a, b) => {
        if(a.type < b.type) return -1
        else if(a.type > b.type) return 1
        else return 0
      }
    },
    {
      title: "Pieza",
      dataIndex: "name",
      width: "33%",
      sorter: (a, b) => {
        if(a.name < b.name) return -1
        else if(a.name > b.name) return 1
        else return 0
      }
    },
    {
      title: "Cantidad",
      dataIndex: "qty",
      width: "31%",
      sorter: (a, b) => {
        return a.qty - b.qty
      }
    },
    {
      title: "Eliminar",
      width: "5%",
      align: 'center',
      render: (text, record, index) => {
        return <Button type="primary" size="small" icon="close" onClick={() => {
          let p = piezas.filter((item, i) => index !==i)
          setPiezas(p)
        }} />
      }
    }
  ]

  return (
    <div className='step3'>
        <Row>
            A continuación ingrese los datos del equipo y las piezas que se reemplazarán
        </Row>
        <Row gutter={12}>
            <Form>
                <Col span={7}>
                    <Form.Item>
                        { getFieldDecorator('type', {
                            rules: [{
                                required: true,
                                message: 'Ingrese Nombre de Sección'
                            }]
                        })(
                            <Input
                                placeholder="Nombre de Sección"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item >
                        { getFieldDecorator('name', {
                            rules: [{
                                required: true,
                                message: 'Ingrese Nombre de la Pieza'
                            }]
                        })(
                            <Input
                                placeholder="Nombre de la Pieza"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={7}>
                    <Form.Item >
                        { getFieldDecorator('qty', {
                            rules: [{
                                required: true,
                                message: 'Ingrese Cantidad'
                              },
                              {
                                validator: (rule, value, callback) => getValidator(rule, value, callback, {type: 'number', decimals: 0})
                              }
                            ]
                        })(
                            <Input
                                placeholder="Cantidad"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col offset={1} span={1}>
                  <Button icon="plus" size="small" type="primary" onClick={addPieza} className="btnAdd" />
                </Col>
            </Form>
        </Row>
        <Row>
          <Table columns={ tableColumns } dataSource={ piezas } size="small"/>
        </Row>
        <Row className="tools">
            <a onClick={prevStepLocal} className="prev-step"><Icon type="left" /></a>
            <a onClick={nextStepLocal} className="next-step"><Icon type="right" /></a>
        </Row>
    </div>
  )
}

export default Form.create()(Step3);
