import "./SectionEdit.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Button,
  Tooltip,
  Modal,
  notification,
  Icon,
  Input,
  Popconfirm,
  Popover
} from "antd";

import { useTranslation } from "react-i18next";
import { TableEdit, FieldSetEdit, Catalogos, ParagraphEdit, SubsectionEdit, TextEdit, DecisionEdit } from './components'
import { Paragraph, Table, FieldSet, Decision } from "../../../FormDeclaration/components";
import { saveSectionPromise } from "../FormDetail/promises";
import { Preview } from '../'

const { TextArea } = Input;

const SectionEdit = ({ s, refreshThisSection, sectionNro }) => {
  const { t } = useTranslation()
  const [section, setSection] = useState(s)
  const [changes, setChanges] = useState(false)
  const [isVisiblePreview, setIsVisiblePreview] = useState(false)

  useEffect(() => {
  }, [])

  const getComponentByType = (type, add) => {
    if(type === "PARAGRAPH") return { id: getRandomId(), type, text: add ? null:'Aqui va el texto de ejemplo', fieldSet: { id: getRandomId(), type: 'FIELDSET', hasTitle: false, fields: []} }
    else if(type === "FIELDSET")  {
      if(add) return {id: getRandomId(), type, cols: 2, hasTitle: true, title: 'Titulo de los datos', fields: [{id: getRandomId(), key: 'field1', type: 'FIELD', hasTitle: false, typeField: 'INPUT', required: true}]}
      else return {id: getRandomId(), type, cols: 2, hasTitle: true, title: 'Titulo de los datos', fields: [{ id: getRandomId(), type: 'FIELD', typeField: 'INPUT', title: 'Dato1', required: true}, {id: getRandomId(), type: 'FIELD', typeField: 'INPUT', title: 'Dato2', required: true}]}
    }else if(type === "TABLE") {
      if(add) return { id: getRandomId(), type, records:[], fieldSet: { id: getRandomId(), type: 'FIELDSET', cols: 2, hasTitle: false, fields: [{id: getRandomId(), key: 'field1', type: 'FIELD', hasTitle: false, typeField: 'INPUT', required: true, tableVisible: true}] }}
      else return { id: getRandomId(), type, text: 'Instrucciones para el llenado de los datos', records:[{fields: {}}], fieldSet: { id: getRandomId(), type: 'FIELDSET', cols: 2, hasTitle: true, title: 'Titulo de los campos', fields: [{id: getRandomId(), key: 'field1', type: 'FIELD', typeField: 'INPUT', title: 'Dato1', required: true, tableVisible: true}, { id: getRandomId(), key: 'field2', type: 'FIELD', title: 'Dato2', typeField: 'INPUT', required: true, tableVisible: true}] }}
    }else if(type === "DECL") {
      if(add) return { id: getRandomId(), type, records:[], fieldSet: { id: getRandomId(), type: 'FIELDSET', cols: 2, hasTitle: false, fields: [{id: getRandomId(), key: 'field1', type: 'FIELD', hasTitle: false, typeField: 'INPUT', required: true, tableVisible: true}] }}
      else return { id: getRandomId(), type, decision: true, text: 'Instrucciones para el llenado de los datos', records:[{fields: {}}], fieldSet: { id: getRandomId(), type: 'FIELDSET', cols: 2, hasTitle: true, title: 'Titulo de los campos', fields: [{id: getRandomId(), key: 'field1', type: 'FIELD', typeField: 'INPUT', title: 'Dato1', required: true, tableVisible: true}, { id: getRandomId(), key: 'field2', type: 'FIELD', title: 'Dato2', typeField: 'INPUT', required: true, tableVisible: true}] }}
    }else if(type === "TEXT") {
      return {id: getRandomId(), type, required: false, hasTitle: false}
    }else if(type === "SUBSECTION") {
      return { id: getRandomId(), type, title: 'Titulo de la subsección', components: []}
    }else if(type === "DECISION") {
      return { id: getRandomId(), type, text: add?null:'Instrucciones para el llenado de los datos', compSi: getComponentByType('SUBSECTION', add), compNo: getComponentByType('SUBSECTION', add)}
    }

  }

  const refreshSection = (s) => {
    setSection(s)
    setChanges(true)
  }

  const handleChangeCatalogoActive = (cats) => {
    let comp = []
    cats.map(c => {
      if(c.active) {
        let _comp = { ...c, type: 'FIELDSET', id: getRandomId()}
        _comp.fields = _comp.fields.filter(f => f.active).map(f => {
          return { ...f, typeField: f.type, type: 'FIELD', id: getRandomId()}
        })
        if(_comp.fields.length > 0) {
          comp.push(_comp)
        }
      }
    })
    let _s = { ...section, components: comp }
    refreshSection(_s)
  }

  const getRandomId = () => {
    return 'R' + Math.floor(Math.random() * 1000000);
  }

  const handlerChangeCatalogo = (_c) => {
    let _fieldset = []
    _c.map(c => {
      let fields = c.fields.filter(f => f.active)
      let _fields = []
      if(fields.length > 0) {
        fields.map(f => {
          let _f = { ...f, typeField: f.type, type: 'FIELD', id: getRandomId() }
          _fields.push(_f)
        })
        let exists = false
        section.components && section.components.map((fs, index) => {
          if(fs.type === 'FIELDSET') {
            if(fs.key === c.key) {
              exists = true
              let _fs = { ...fs, fields: _fields }              
              _fieldset.push(_fs)
            }
          }
        })
        if(!exists) {
          let _fs = { ...c, type: 'FIELDSET', fields: _fields}
          _fieldset.push(_fs)
        }
      }
    })
    let _s = { ...section, components: _fieldset}
    refreshSection(_s)
  }

  const saveThisSection = () => {
    saveSectionPromise(section).then(response => {
      notification.success({
        message: 'Datos guardados',
        description: 'Se guardaron los datos exitosamente'
      })
      refreshThisSection(response)
      setChanges(false)
    })

    //exitSection()
  }

  const handlePreviewSection = () => {
    setIsVisiblePreview(true)
  }

  const closeModalHandler = () => {
    setIsVisiblePreview(false)
  }

  const handleChangeValuesSection = (component) => {
    let _s = { ...section }
    let comp = []
    _s.components.map((c, i) => {
      if((c.type === 'FIELD' || c.type === 'FIELDSET') && c.id === component.id) {
        comp.push(component)
      }else if(c.fieldSet && c.fieldSet.id === component.id) {
        comp.push({ ...c, fieldSet: component })
      }else {
        comp.push(c)
      }
    })
    _s.components = comp
    refreshSection(_s)
  }

  const getTooltipComponent = (c) => {
    if(c === 'PARAGRAPH') return 'Párrafo'
    else if(c === 'FIELDSET') return 'Datos'
    else if(c === 'TABLE') return 'Tabla'
    else if(c === 'DECL') return 'Pregunta tipo Declaración'
    else if(c === 'TEXT') return 'Campo de Texto'
    else if(c === 'SUBSECTION') return 'Sub Seccion'
    else if(c === 'DECISION') return 'Decisión'
  }

  const handleClickComponent = (c) => {
    let comp = []
    section.components.map(c => {
      comp.push(c)
    })
    comp.push(getComponentByType(c, true))

    let _s = { ...section, components:  comp }
    refreshSection(_s)
  }

  const deleteComponent = (index) => {
    let comp = section.components.filter((c,i) => index !== i)
    let _s = { ...section, components:  comp }
    refreshSection(_s)
  }

  const getTextComponent = (comp) => {
    if(comp === 'PARAGRAPH') return 'Se incluye una caja de texto que permite agregar texto personalizado con campos incrustados opcionales'
    else if(comp === 'FIELDSET') return 'Se incluye grupo de datos personalizados'
    else if(comp === 'TABLE') return 'Se incluye grupo de datos personalizados para agregar en registros a una Tabla'
    else if(comp === 'DECL') return 'Se incluye una deción inicial y grupo de datos personalizados para agregar en registros a una Tabla'
    else if(comp === 'TEXT') return 'Se incluye un campo de texto para ser completado por el usuario'
    else if(comp === 'SUBSECTION') return 'Se incluye una Subsección que permite agregar otros elementos'
    else if(comp === 'DECISION') return 'Se incluye un elemento de Decisión y elementos asociados a la decisión'
  }

  const getContentPopOver = (comp) => {
    return <Row className="overlayExample">
      <Col className="explain-component" span={24}>{getTextComponent(comp)}</Col>
      <Col className="component-example"span={24}>
      { comp === 'PARAGRAPH' && 
        <Paragraph component={getComponentByType(comp)} mode="preview" />
      }
      { comp === 'FIELDSET' && 
        <FieldSet section={section} parent={section} component={getComponentByType(comp)} mode="preview" />
      }
      { (comp === 'TABLE' || comp === 'DECL') && 
        <Table section={section} component={getComponentByType(comp)} mode="preview" />
      }
      { comp === 'TEXT' && 
        <TextArea rows={4} value='' disabled={true} />
      }
      { comp === 'DECISION' && 
        <Decision section={section} component={getComponentByType(comp)} mode="preview" />
      }
      </Col>
    </Row>
  }

  return (
    <div className="section-edit">
      <Row>
        {sectionNro &&
        <Col className="section-top">Sección #{sectionNro}</Col>
        }
        <Col span={12} md={12} sm={24} xs={24}>
          <h2>{ section.title }</h2>
        </Col>
        { !sectionNro &&
          <Col span={12} md={12} sm={24} xs={24} className="tools">
            <Button disabled={!changes} onClick={saveThisSection} type="primary">Guardar Cambios</Button>
            {/*<Button onClick={exitSection}>Salir sin Guardar</Button>*/}
            <Button onClick={handlePreviewSection} type="primary">Previsualizar</Button>
          </Col>
        }
      </Row>
      { !sectionNro &&
      <>
        { (section.type === 'CONTACTPERSON' || section.type === 'CONTACTENTITY') &&
          <Catalogos handleChangeCatalogoActive={handleChangeCatalogoActive} handlerChangeCatalogo={handlerChangeCatalogo}
            section={section} type={section.type}
          />
        }
        { section.type === 'CUSTOM' &&
          <Row className="custom-tools">
            <ul className="custom-tools-group-menu">
            {["SUBSECTION", "PARAGRAPH", "FIELDSET", "TABLE", "DECL", "DECISION", "TEXT"].map(c =>
              <Popover content={getContentPopOver(c)} title={getTooltipComponent(c)} trigger="hover" placement="bottom">
                <li>
                    <a href="#0" onClick={() => handleClickComponent(c)}>
                      <span>
                        { c === "PARAGRAPH" && <><Icon type="align-center" />&nbsp;Párrafo</>}
                        { c === "FIELDSET" && <><Icon type="form" />&nbsp;Datos</>}
                        { c === "TABLE" && <><Icon type="table" />&nbsp;Tabla</>}
                        { c === "DECL" && <><Icon type="table" />&nbsp;Declaración</>}
                        { c === "TEXT" && <><Icon type="edit" />&nbsp;Texto</>}
                        { c === "SUBSECTION" && <><Icon type="profile" />&nbsp;Sub Seccion</>}
                        { c === "DECISION" && <><Icon type="fork" />&nbsp;Decisión</>}
                      </span>
                      <span>
                        <Tooltip title="Agregar">
                          <Icon type="plus"/>
                        </Tooltip>
                      </span>
                    </a>
                </li>
              </Popover>
              )}
            </ul>
          </Row>
        }

        <div className={'section-components section-type-'+section.type}>
          { section.components && (section.type === 'CONTACTPERSON' || section.type === 'CONTACTENTITY') &&
            <Row><h4>Datos seleccionados</h4></Row>
          }
          { section.components && section.components.map((component, index) =>
            <Row className={'row-component-section row-' + component.type}>
              { section.type === 'CUSTOM' &&
                <Row className="header-section-component-custom">
                  <Col span={20}><strong>{index+1}. {getTooltipComponent(component.type)}</strong></Col>
                  <Col span={4} className="tools-section-component-custom">
                    <Tooltip title="Eliminar Componente" placement="bottom">
                      <Popconfirm title="Confirma eliminar el Componente?" onConfirm={(e) => deleteComponent(index)}>
                        <Button size="small" icon="delete" />
                      </Popconfirm>
                    </Tooltip>
                  </Col>
                </Row>
              }
              { component.type === 'PARAGRAPH' &&
                <ParagraphEdit section={section} component={component} fieldset={component.fieldSet} handleChangeValuesSection={handleChangeValuesSection} />
              }
              { component.type === 'FIELDSET' &&
                <FieldSetEdit section={section} component={component} fieldset={component} handleChangeValuesSection={handleChangeValuesSection} />
              }
              { (component.type === 'TABLE' || component.type === 'DECL') &&
                <TableEdit section={section} component={component} fieldset={component.fieldSet} handleChangeValuesSection={handleChangeValuesSection} />
              }
              { component.type === 'TEXT' &&
                <TextEdit section={section} component={component} handleChangeValuesSection={handleChangeValuesSection}/>
              }
              { component.type === 'SUBSECTION' &&
                <SubsectionEdit indexSection={index} section={section} component={component} subsection={component} 
                  handleChangeValuesSection={handleChangeValuesSection}
                  getComponentByType={getComponentByType} getTooltipComponent={getTooltipComponent} />
              }
              { component.type === 'DECISION' &&
                <DecisionEdit section={section} component={component}
                  handleChangeValuesSection={handleChangeValuesSection}
                  getComponentByType={getComponentByType} getTooltipComponent={getTooltipComponent}
                />
              }
            </Row>
          )}
        </div>
      </>
      }
      { isVisiblePreview &&
        <Modal
          title="Vista Previa"
          className="preview-modal"
          footer={ null }
          visible={ true }
          onOk={ closeModalHandler  }
          onCancel={ closeModalHandler }
        >
          <div>
            <Preview section={section} closeModalHandler={closeModalHandler} />
          </div>
        </Modal>
      }
    </div>
  )
}
export default SectionEdit;
