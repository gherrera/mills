import './Step4.scss'
import React, { useEffect, useState } from 'react'
import { Select, Input, Button, Row, Col, Form, Icon, Table, notification, AutoComplete } from 'antd'
import { getPersonasPromise } from '../../../../promises'

const Step4 = ({form, personal, prevStep, nextStep, usuarios, notifPersonal, mode }) => {
  const { getFieldDecorator, validateFields, setFieldsValue } = form;
  const [personas, setPersonas] = useState([])
  const [cargo, setCargo] = useState(null)
  const [listaPersonas, setListaPersonas] = useState([])
  const [listaPersonasSel, setListaPersonasSel] = useState([])
  const [rut, setRut] = useState(null)

  useEffect(() => {
    if(personal) setPersonas(personal)

    getPersonasPromise().then(p => {
      setListaPersonas(p)
      setListaPersonasSel(p)
    })
  }, [])

  const prevStepLocal = () => {
    prevStep(personas)
  }

  const nextStepLocal = () => {
    if(personas.length > 0) {
      nextStep(personas)
    }else {
      notification.error({
        message: 'Error',
        description: 'Debe agregar al menos una Persona'
      })
    }
  }

  const getTypeTurno = (t) => {
    if(t === 'DAY') return 'Día'
    else if(t === 'NIGHT') return 'Noche'
  }

  const addPersona = () => {
    validateFields(['turno','role','name','rut']).then((p) => {
      if(p.role === 'CONTROLLER') {
        const controllers = personas.filter(item => item.turno === p.turno && item.role === 'CONTROLLER')
        if(controllers.length > 0) {
          notification.error({
            message: 'Error',
            description: 'Ya existe un Controlador para el turno: ' + getTypeTurno(p.turno)
          })
          return
        }else {
          const controllers = personas.filter(item => item.controllerId === p.name)
          if(controllers.length > 0) {
            notification.error({
              message: 'Error',
              description: 'Controlador ya está asignado al turno: ' + getTypeTurno(controllers[0].turno)
            })
            return
          }else {
            const usr = usuarios.filter(u => u.id === p.name)[0]
            p.controllerId = p.name
            p.name = usr.name
          }
        }
      }

      let ps = [...personas, p]
      setPersonas(ps)
      setFieldsValue({turno: undefined, role: undefined, name: null, rut: null})
      if(notifPersonal) notifPersonal(ps)
    })
  }

  const getTableColumns = () => {
    let columns = [
      {
        title: "Turno",
        dataIndex: "turno",
        width: "20%",
        render: (text) => getTypeTurno(text),
        sorter: (a, b) => {
          if(a.turno < b.turno) return -1
          else if(a.turno > b.turno) return 1
          else return 0
        }
      },
      {
        title: "Cargo",
        dataIndex: "role",
        width: "20%",
        render: (text) => text === 'CONTROLLER' ? 'Controlador' : text,
        sorter: (a, b) => {
          if(a.role < b.role) return -1
          else if(a.role > b.role) return 1
          else return 0
        }
      },
      {
        title: "Nombre",
        dataIndex: "name",
        width: "30%",
        sorter: (a, b) => {
          if(a.name < b.name) return -1
          else if(a.name > b.name) return 1
          else return 0
        }
      },
      {
        title: "Rut",
        dataIndex: "rut",
        width: "20%",
        sorter: (a, b) => {
          if(a.rut < b.rut) return -1
          else if(a.rut > b.rut) return 1
          else return 0
        }
      }
    ]
    if(mode === "new" || mode === "edit") {
      columns.push(
        {
          title: "Eliminar",
          width: "10%",
          align: 'center',
          render: (text, record, index) => {
            return <Button type="primary" size="small" icon="close" onClick={() => {
              let p = personas.filter((item, i) => index !==i)
              setPersonas(p)
              setListaPersonasSel(listaPersonas)
              if(notifPersonal) notifPersonal(p)
            }} />
          }
        }
      )
    }

    return columns
  }

  const changeCargo = (value) => {
    setCargo(value)
    setFieldsValue({name: null, rut: null})
    setListaPersonasSel(listaPersonas)
  }

  const onSelect = (value, obj) => {
    setFieldsValue({name: value, rut: obj.key})
    setRut(obj.key)
  }

  const onSearch = (value) => {
      let lp = listaPersonas.filter(p => p.nombre.toLowerCase().includes(value.toLowerCase()) || p.rut.toLowerCase().includes(value.toLowerCase()))
      setListaPersonasSel(lp)
      if(rut) {
        setFieldsValue({name: undefined, rut: undefined})
        setRut(null)
      }
  }

  return (
    <div className='step4'>
        { mode === "new" &&
          <Row>
              A continuación ingrese los datos del personal que ocupará cada turno de trabajo
          </Row>
        }
        { (mode === "new" || mode === "edit") &&
          <Row gutter={4}>
              <Form>
                  <Col span={5}>
                      <Form.Item>
                          { getFieldDecorator('turno', {
                              rules: [{
                                  required: true,
                                  message: 'Seleccione un Turno'
                              }]
                          })(
                              <Select placeholder="Turno">
                                  <Select.Option value="DAY">Día</Select.Option>
                                  <Select.Option value="NIGHT">Noche</Select.Option>
                              </Select>
                          )}
                      </Form.Item>
                  </Col>
                  <Col span={5}>
                      <Form.Item >
                          { getFieldDecorator('role', {
                              rules: [{
                                  required: true,
                                  message: 'Seleccione un Cargo'
                              }]
                          })(
                              <Select placeholder="Cargo" onChange={changeCargo}>
                                <Select.Option value="CONTROLLER">Controlador</Select.Option>
                                <Select.Option value="Operario">Operario</Select.Option>
                                <Select.Option value="Ayudante">Ayudante</Select.Option>
                                <Select.Option value="Torchador/Carrero/Mecánico">Torchador/Carrero/Mecánico</Select.Option>
                                <Select.Option value="Torchador/Mecánico">Torchador/Mecánico</Select.Option>
                                <Select.Option value="Oxigenista/Mecánico">Oxigenista/Mecánico</Select.Option>
                                <Select.Option value="Armador/Mecánico">Armador/Mecánico</Select.Option>
                                <Select.Option value="Lider Mecánico">Lider Mecánico</Select.Option>
                                <Select.Option value="Supervisor de Torque">Supervisor de Torque</Select.Option>
                                <Select.Option value="Mecánico">Mecánico</Select.Option>
                                <Select.Option value="Señalero/Mecánico">Señalero/Mecánico</Select.Option>
                                <Select.Option value="Control Pieza">Control Pieza</Select.Option>
                                <Select.Option value="Asesor en prevención de riesgo">Asesor en prevención de riesgo</Select.Option>
                                <Select.Option value="Prevencionista de Riesgos">Prevencionista de Riesgos</Select.Option>
                                <Select.Option value="Mecánico/Bodeguero">Mecánico/Bodeguero</Select.Option>
                                <Select.Option value="Mecánico/Conductor Camión Pañol">Mecánico/Conductor Camión Pañol</Select.Option>
                                <Select.Option value="Conductor de Buses">Conductor de Buses</Select.Option>
                                <Select.Option value="Mecánico/Vigía del fuego">Mecánico/Vigía del fuego</Select.Option>
                                <Select.Option value="Mecánico/Vigía Espacios Confinados">Mecánico/Vigía Espacios Confinados</Select.Option>
                                <Select.Option value="Mecánico/Operador Grúa Horquilla">Mecánico/Operador Grúa Horquilla</Select.Option>
                                <Select.Option value="Mecánico/Operador máquina Lainera">Mecánico/Operador máquina Lainera</Select.Option>
                                <Select.Option value="Mecánico/Operador Puente Grúa">Mecánico/Operador Puente Grúa</Select.Option>
                                <Select.Option value="Planificador/Mecánico">Planificador/Mecánico</Select.Option>
                                <Select.Option value="Supervisor de cambio de revestimiento">Supervisor de cambio de revestimiento</Select.Option>
                                <Select.Option value="Mecánico/Soldador">Mecánico/Soldador</Select.Option>
                                <Select.Option value="Rigger/Mecánico">Rigger/Mecánico</Select.Option>
                                <Select.Option value="Gerente General">Gerente General</Select.Option>
                                <Select.Option value="Mecánico/Andamiero">Mecánico/Andamiero</Select.Option>
                                <Select.Option value="Supervisor de Andamios">Supervisor de Andamios</Select.Option>
                                <Select.Option value="Administrador de Contrato">Administrador de Contrato</Select.Option>
                                <Select.Option value="Administración & Logística">Administración & Logística</Select.Option>
                                <Select.Option value="Gerente Operacional">Gerente Operacional</Select.Option>
                                <Select.Option value="Ingeniero en Gestión">Ingeniero en Gestión</Select.Option>
                              </Select>
                          )}
                      </Form.Item>
                  </Col>
                  <Col span={7}>
                      <Form.Item >
                          { getFieldDecorator('name', {
                              rules: [{
                                  required: true,
                                  message: cargo === 'CONTROLLER' ? 'Seleccione un Controlador' : 'Ingrese nombre de la Persona'
                              }]
                          })(
                            cargo === 'CONTROLLER' ?
                                <Select placeholder="Controlador">
                                  { usuarios.filter(u => u.type === 'CONTROLLER').map(u =>
                                    <Select.Option value={u.id}>{u.name}</Select.Option>
                                  )}
                                </Select>
                              :
                              <AutoComplete
                                  dataSource={listaPersonasSel.map(p => 
                                    <AutoComplete.Option key={p.rut} value={p.nombre}>
                                      {p.nombre}
                                    </AutoComplete.Option>
                                  )}
                                  disabled={!cargo}
                                  onSelect={onSelect}
                                  onSearch={onSearch}
                                  placeholder="Persona"
                              />
                          )}
                      </Form.Item>
                  </Col>
                  <Col span={5}>
                      <Form.Item >
                          { getFieldDecorator('rut', {
                              rules: [{
                                  required: true,
                                  message: 'Ingrese rut de la Persona'
                              }]
                          })(
                            <Input placeholder="Rut de la Persona" disabled={!cargo || (cargo !== 'CONTROLLER' && rut)}/>
                          )}
                      </Form.Item>
                  </Col>
                  
                  <Col offset={1} span={1}>
                    <Button icon="plus" size="small" type="primary" onClick={addPersona} className="btnAdd" />
                  </Col>
              </Form>
          </Row>
        }
        <Row>
          <Table columns={ getTableColumns() } dataSource={ personas } size="small" pagination={personas.length > 10}/>
        </Row>
        { mode === "new" &&
          <Row className="tools">
              <a onClick={prevStepLocal} className="prev-step"><Icon type="left" /></a>
              <a onClick={nextStepLocal} className="next-step"><Icon type="right" /></a>
          </Row>
        }
    </div>
  )
}

export default Form.create()(Step4);
