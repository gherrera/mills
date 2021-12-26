import "./ModalNewSection.scss";
import React, { useEffect, useState, useContext} from "react";
import {
  Col,
  Row,
  Modal,
  Icon,
  Button,
  Input,
  Radio,
  Form,
  notification,
  Popover
} from "antd";

import { Paragraph, FieldSet, Table, Text, Section, Decision } from "../../../FormDeclaration/components";

import personIcon from './img/person.png'
import entityIcon from './img/entity.png'

const { confirm } = Modal;

const ModalNewSection = ({ form, handlerAddSection }) => {
    const { getFieldDecorator, validateFields } = form;
    const [type, setType] = useState(null)
    const [section, setSection] = useState({status: 'ACTIVE', type: null})

    useEffect(() => {
    }, [section])

    const onChangeRadio = (value) => {
        setType(value)
        if(value === 2) setSection({...section, type: 'CUSTOM'})
        else setSection({...section, type: null})
    }

    const handleChangeTitle = (value) => {
        setSection({...section, title: value})
    }

    const handlerBtnAdd = () => {
        validateFields(['title', 'type']).then(() => {
            if((type === 1 || type === 3) && section.type === null) {
                notification.error({
                    message: 'Debe seleccionar un tipo de Sección'
                })
            }else {
                handlerAddSection(section)
                /*confirm({
                    title: 'Nueva sección',
                    content: 'Confirma la creación de la nueva sección?',
                    onOk() {
                    },
                    onCancel() {},
                  });
                */
            }
        })
    }

    const selectTypeFields = (type) => {
        let c = getComponentNewSection(type, true)
        setSection({...section, type, components: c.components})
    }

    const getContentPopOver = (comp) => {
        return <Row className="overlayExample">
          <Col className="explain-component" span={24}>{getTextComponent(comp)}</Col>
          <Col className="component-example"span={24}>
          { (comp === 'PARAGRAPH') && 
            <Paragraph component={getComponentByType(comp)} mode="preview" />
          }
          { (comp === 'FIELDSET') && 
            <FieldSet section={{}} parent={{}} component={getComponentByType(comp)} mode="preview" />
          }
          { (comp === 'TABLE' || comp === 'DECL') && 
            <Table section={{}} component={getComponentByType(comp)} mode="preview" />
          }
          { comp === 'TEXT' && 
            <Text component={getComponentByType(comp)} mode="preview" />
          }
          { comp === 'DECISION' && 
            <Decision component={getComponentByType(comp)} mode="preview" />
          }
          </Col>
        </Row>
    }

    const getContentPopOverSection = (s) => {
        return <Row className="overlayExample">
          <Col className="explain-component" span={24}>{getTextComponent(s)}</Col>
          <Col className="component-example"span={24}>
            <Section key={getRandomId()} section={getComponentNewSection(s)} mode="previewpop" />
          </Col>
        </Row>
    }

    const getComponentNewSection = (type, add) => {
        if(type === 'TABLE' || type === 'DECL') {
            if(add) return { components: [getComponentByType(type, add)]}
            else return { components: [getComponentByType(type, add)], title: section.title?section.title:'Título de la sección'};
        }else if(type === 'DATA') {
            if(add) return { components: [getComponentByType('PARAGRAPH', add), getComponentByType('FIELDSET', add, {addField:true})]};
            else return { title: section.title?section.title:'Título de la sección', components: [getComponentByType('PARAGRAPH', add), getComponentByType('FIELDSET', add)]};
        }else if(type === 'INTRO') {
            if(add) return { components: [getComponentByType('PARAGRAPH', add, {addFieldset: true})]};
            else return { title: section.title?section.title:'Título de la sección', components: [getComponentByType('PARAGRAPH', add, {addFieldset: true})]};
        }else if(type === 'TEXT') {
          return { title: section.title?section.title:'Título de la sección', components: [getComponentByType('PARAGRAPH', add)] };
        }else if(type === 'COMMENTS') {
          return { title: section.title?section.title:'Título de la sección', components: [getComponentByType('PARAGRAPH', add), getComponentByType('TEXT', add)] };
        }else if(type === 'DECISION') {
            return { title: section.title?section.title:'Título de la sección', components: [getComponentByType('DECISION', add)] };
        }else {
          return { components: [] };
        }
    }

    const getTooltipComponent = (c) => {
        if(c === 'PARAGRAPH') return 'Párrafo'
        else if(c === 'INTRO') return 'Párrafo con Datos'
        else if(c === 'DATA') return 'Datos personalizados'
        else if(c === 'FIELDSET') return 'Datos'
        else if(c === 'TABLE') return 'Tabla'
        else if(c === 'DECL') return 'Pregunta tipo Declaración'
        else if(c === 'TEXT') return 'Campo de Texto'
        else if(c === 'COMMENTS') return 'Comentarios'
        else if(c === 'SUBSECTION') return 'Sub Seccion'
        else if(c === 'DECISION') return 'Decisión'
    }

    const getTextComponent = (comp) => {
        if(comp === 'PARAGRAPH' || comp === 'INTRO') return 'Se incluye una caja de texto que permite agregar texto personalizado con campos incrustados opcionales'
        else if(comp === 'FIELDSET' || comp === "DATA") return 'Se incluye grupo de datos personalizados'
        else if(comp === 'TABLE') return 'Se incluye grupo de datos personalizados para agregar en registros a una Tabla'
        else if(comp === 'DECL') return 'Se incluye una deción inicial y grupo de datos personalizados para agregar en registros a una Tabla'
        else if(comp === 'TEXT') return 'Se incluye un campo de texto para ser completado por el usuario'
        else if(comp === 'COMMENTS') return 'Se incluye un párrafo y un campo de texto para ser completado por el usuario'
        else if(comp === 'SUBSECTION') return 'Se incluye una Subsección que permite agregar otros elementos'
        else if(comp === 'DECISION') return 'Se incluye un elemento de decisión y elementos asociados a la decisión'
    }

    const getComponentByType = (type, add, params={addFieldset: false}) => {
        if(type === "PARAGRAPH") {
            if(add && params.addFieldset) return { id: getRandomId(), type, fieldSet: getComponentByType('FIELDSET', add, params) }
            else if(add) return { id: getRandomId(), type }
            else return { id: getRandomId(), type, text: 'Aqui va el texto de ejemplo', fieldSet: getComponentByType('FIELDSET', add) }
        }else if(type === "FIELDSET")  {
            if(add && params.addField) return {id: getRandomId(), type, cols: 2, fields: [{ id: getRandomId(), type: 'FIELD', typeField: 'INPUT', required: true, tableVisible: true}]}
            else if(add) return {id: getRandomId(), type, cols: 2, hasTitle: params.title, title: params.title?'Titulo de los datos':null, fields: []}
            else return {id: getRandomId(), type, cols: 2, hasTitle: params.title, title: params.title?'Titulo de los datos':null, fields: [{ id: getRandomId(), type: 'FIELD', typeField: 'INPUT', title: 'Dato1', required: true}, {id: getRandomId(), type: 'FIELD', typeField: 'INPUT', title: 'Dato2', required: true}]}
        }else if(type === "TABLE") {
          return { id: getRandomId(), type, text: add?null:'Instrucciones para el llenado de los datos', records:[], fieldSet: getComponentByType('FIELDSET', add, {addField: true, title: false})}
        }else if(type === "DECL") {
          return { id: getRandomId(), type, decision: true, text: add?null:'Instrucciones para el llenado de los datos', records:[], fieldSet: getComponentByType('FIELDSET', add, {addField: true, title: false})}
        }else if(type === "TEXT") {
          return {id: getRandomId(), type, required: false, hasTitle: false}
        }else if(type === 'COMMENTS') {
          return { id: getRandomId(), type, components: [getComponentByType('PARAGRAPH', add), {id: getRandomId(), type: 'TEXT', required: true, hasTitle: false}] };
        }else if(type === "SUBSECTION") {
          return { id: getRandomId(), type, title: 'Titulo de la subsección', components: []}
        }else if(type === "DECISION") {
            return { id: getRandomId(), type, text: add?null:'Instrucciones para el llenado de los datos', compSi: getComponentByType('SUBSECTION', add), compNo: getComponentByType('SUBSECTION', add)}
        }
    
    }

    const getRandomId = () => {
        return 'R' + Math.floor(Math.random() * 1000000);
    }
    
    return (
        <div className="modal-new-section-body">
            <h2>Diseño de una Sección</h2>
            <Col className="col-input-name">
                <Form.Item>
                    {getFieldDecorator('title', {
                        validateTrigger: "onChange",
                        rules:
                        [
                            { required: true, message: 'Campo requerido' }
                        ]
                    })(
                    <Input placeholder="Escriba el nombre de la nueva sección" onChange={(e) => handleChangeTitle(e.target.value)}/>
                    )}
                </Form.Item>
            </Col>
            <Col><h3>Seleccione el tipo de Sección que requiere</h3></Col>
            <Form.Item className="item-radio-type">
                {getFieldDecorator('type', {
                    validateTrigger: "onChange",
                    rules:
                    [
                        { required: true, message: 'Campo requerido' }
                    ]
                })(
                <Radio.Group onChange={(e) => onChangeRadio(e.target.value)} value={type}>
                    <Row>
                        <Col span={8}><Radio value={1}>Agrega Campos</Radio></Col>
                        <Col span={8}><Radio value={2}>Seccion Personalizada</Radio></Col>
                        <Col span={8}><Radio value={3}>Plantillas prediseñadas</Radio></Col>
                    </Row>
                </Radio.Group>
                )}
            </Form.Item>
            { type &&
                <Row className="box-section-type">
                    { type === 1 &&
                        <div>
                            <span className="title">Puedes elegir los campos que necesites agregar a tu sección, selecciona el catalogo de datos de:</span>
                            
                            <Col span={8} offset={4}>
                                <div className={'section-type-box'+(section.type==='CONTACTPERSON'?' selected':'')} onClick={() => selectTypeFields('CONTACTPERSON')}>
                                    <Col>
                                        <img src={personIcon} />
                                    </Col>
                                    <Col>Personas Naturales</Col>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className={'section-type-box'+(section.type==='CONTACTENTITY'?' selected':'')} onClick={() => selectTypeFields('CONTACTENTITY')}>
                                    <Col>
                                        <img src={entityIcon} />
                                    </Col>
                                    <Col>Personas Jurídicas</Col>
                                </div>
                            </Col>
                        </div>
                    }
                    { type === 2 &&
                        <div>
                            <span className="title">Con la sección personaliza podrás diseñar la sección libremente o agregar subsecciones</span>

                            <Row className="custom-tools">
                                <ul className="custom-tools-group-menu">
                                {["SUBSECTION", "PARAGRAPH", "FIELDSET", "TABLE", "DECL", "DECISION", "TEXT"].map(c =>
                                    <Popover content={getContentPopOver(c)} title={getTooltipComponent(c)} trigger="hover" placement="bottom">
                                    <li>
                                        <a href="#0">
                                            <span>
                                            { c === "PARAGRAPH" && <><Icon type="align-center" />&nbsp;Párrafo</>}
                                            { c === "FIELDSET" && <><Icon type="form" />&nbsp;Datos</>}
                                            { c === "TABLE" && <><Icon type="table" />&nbsp;Tabla</>}
                                            { c === "DECL" && <><Icon type="table" />&nbsp;Declaración</>}
                                            { c === "TEXT" && <><Icon type="edit" />&nbsp;Texto</>}
                                            { c === "SUBSECTION" && <><Icon type="profile" />&nbsp;Sub Seccion</>}
                                            { c === "DECISION" && <><Icon type="fork" />&nbsp;Decisión</>}
                                            </span>
                                        </a>
                                    </li>
                                    </Popover>
                                    )}
                                </ul>
                            </Row>
                        </div>
                    }
                    { type === 3 &&
                        <div>
                            <span className="title">Escoja una de las siguientes plantillas:</span>

                            <Row className="row-plant-section">
                                <Col span={1}></Col>
                                {["INTRO", "DATA", "DECL", "TABLE", "DECISION", "TEXT", "COMMENTS"].map(c =>
                                    <Popover content={getContentPopOverSection(c)} title={getTooltipComponent(c)} trigger="hover" placement="bottom">
                                    <Col span={3} onClick={() => selectTypeFields(c)} className={'section-type-box' + (section.type === c ? ' selected':'')}>
                                        <Col>
                                            { c === "INTRO" && <Icon type="align-center" /> }
                                            { c === "DATA" && <Icon type="form" /> }
                                            { (c === "DECL" || c === 'TABLE') && <Icon type="table" /> }
                                            { c === "TEXT" && <Icon type="edit" /> }
                                            { c === "COMMENTS" && <Icon type="edit" /> }
                                            { c === "DECISION" && <Icon type="fork" /> }
                                        </Col>
                                        <Col>
                                            { c === "INTRO" && 'Párrafo con Datos' }
                                            { c === "DATA" && 'Datos personalizados' }
                                            { c === "DECL" && 'Pregunta tipo Declaración' }
                                            { c === "TABLE" && 'Tipo Tabla' }
                                            { c === "TEXT" && 'Cuadro de Texto' }
                                            { c === "COMMENTS" && 'Comentarios' }
                                            { c === "DECISION" && 'Decisión' }
                                        </Col>
                                    </Col>
                                    </Popover>
                                )}
                            </Row>
                        </div>
                    }
                </Row>
            }
            <Row className="btn-tools-add-section">
                <Col><Button type="primary" icon="plus" onClick={handlerBtnAdd} disabled={section.type===null}>Agregar</Button></Col>
            </Row>
        </div>
    )
}

export default Form.create()(ModalNewSection)