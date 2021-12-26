import "./FormDetail.scss";
import React, { useEffect, useState, useContext} from "react";
import {
  Col,
  Row,
  Modal,
  Checkbox,
  Button,
  Input,
  Spin,
  Popconfirm,
  Tooltip,
  Icon,
  Radio
} from "antd";
import { SectionEdit, Preview, ModalNewSection, FormEdit } from '../'
import { datasourcesContext } from '../../../../contexts'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { useTranslation } from "react-i18next";
import { getFormByIdPromise, saveFormPromise } from "./promises";

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  cursor: 'auto',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getRandomId = () => {
  return 'R' + Math.floor(Math.random() * 1000000);
}

const FormDetail = ({ formId, refreshBreadCrumbs }) => {
	const { t } = useTranslation()
  const [form, setForm] = useState(null)
  const [sections, setSections] = useState([])
  const [section, setSection] = useState(null)
  const [isVisiblePreview, setIsVisiblePreview] = useState(false)
  const { loadFormDatasource } = useContext(datasourcesContext)
  const [isVisibleNewSection, setIsVisibleNewSection] = useState(false)
  const [mode, setMode] = useState('list')
  const [keyForm, setKeyForm] = useState(getRandomId())

  useEffect(() => {
		loadForm()
    loadFormDatasource(formId)
	}, [])

  const loadForm = () => {
    setForm(null)
		getFormByIdPromise(formId).then(f=>{
      setForm(f)
      setSections(f.sections)
		})
  }

  const handlerAddSection = async (section) => {
    closeModalSectionHandler()

    let joined = sections.concat(section);
    setSections(joined)
    let f = await saveForm(joined)
    editSection(f.sections[f.sections.length-1])
  }

  const deleteSection = (index) => {
    let sec = sections.filter((item, i) => i !== index)
    setSections(sec);

    saveForm(sec)
  }

  const handleChangeAttrSection = (index, key, value) => {
    let sec = sections.map((section, i) => {
      if (index == i) {
        return { ...section, [key]: value };
      } else {
        return section;
      }
    })
    setSections(sec)

    if(key !== 'title' && sec[index].type !== null && sec[index].type !== undefined) saveForm(sec)
  }

  const handleBlurTitle = () => {
    saveForm(sections)
  }

  const handleChangeTitle = (index, value) => {
    handleChangeAttrSection(index, 'title', value)
  }

  const changeActiveSection = (index, checked) => {
    handleChangeAttrSection(index, 'status', checked ? 'ACTIVE' : 'INACTIVE')
  }

  const changePrefillSection = (index, checked) => {
    handleChangeAttrSection(index, 'prefilled', checked)
  }

  const getTypeSection = (type) => {
    if(type === 'INTRO') return "Párrafo con Datos"
    else if(type === 'CONTACTPERSON') return "Catálogo de Datos de Persona Natural"
    else if(type === 'CONTACTENTITY') return "Catálogo de Datos de Persona Jurídica"
    else if(type === 'DATA') return "Datos Personalizados"
    else if(type === 'TABLE') return "Tabla"
    else if(type === 'DECL') return "Pregunta Tipo Declaración"
    else if(type === 'TABLE') return "Tabla"
    else if(type === 'TEXT') return "Cuadro de Texto"
    else if(type === 'COMMENTS') return "Comentarios"
    else if(type === 'CUSTOM') return "Seccion Personalizada"
    else if(type === 'DECISION') return "Decisión"
  }

  const editSection = (s) => {
    s.formId = formId
    setSection(s)
    refreshBreadCrumbs(getTypeSection(s.type), null)
  }

  const refreshSection = (s) => {
    setSections(
      sections.map((section, i) => {
        if (section.id === s.id) {
          return s;
        } else {
          return section;
        }
      }
    ))
    if(section !== null) setSection(s)
  }

  const saveForm = async (s) => {
    let f = await saveFormPromise({ ...form, sections: s})
    setForm(f)
    setSections(f.sections)
    setKeyForm(getRandomId())
    return f
  }

  const handlePreviewSection = () => {
    setIsVisiblePreview(true)
  }

  const closeModalHandler = () => {
    setIsVisiblePreview(false)
  }

  const openModalSectionHandler = () => {
    setIsVisibleNewSection(true)
  }

  const closeModalSectionHandler = () => {
    setIsVisibleNewSection(false)
  }

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const newIndex = result.source.index
    const oldIndex = result.destination.index
    let sec = sections
    let tmp = sec[newIndex]
    sec[newIndex] = sec[oldIndex]
    sec[oldIndex] = tmp
    saveForm(sec)
  }

  const onChangeMode = (e) => {
    setMode(e.target.value)
  }

  return (
    <div className="form-detail">
      { form === null ? <Spin/>
        :
        <>
          { section ? <SectionEdit s={section} refreshThisSection={refreshSection} />
          :
          <div className="form">
            <Row className="row-tools">
              <Col span={8}>
                <Button onClick={openModalSectionHandler} type="primary" className="btn-add-section">Nueva Sección</Button>
              </Col>
              <Col span={8} style={{textAlign:'center'}}>
                <Radio.Group onChange={onChangeMode} defaultValue={mode}>
                  <Radio.Button value="list"><Icon type="unordered-list"/>&nbsp;Lista</Radio.Button>
                  <Radio.Button value="design"><Icon type="form"/>&nbsp;Diseño</Radio.Button>
                  <Radio.Button value="preview"><Icon type="file-text"/>&nbsp;Previsualizar</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>
            { mode === 'list' ?
            <>
              <Row className="titles-section">
                <Col span={9}>Nombre de la Sección</Col>
                <Col span={6}>Tipo de Sección</Col>
                <Col span={3} className="center">Activar</Col>
                <Col span={3} className="center">Prellenado</Col>
                <Col span={2}>Edición</Col>
                <Col span={1}>Orden</Col>
              </Row>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      { sections.map((section, index) =>
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                          {(provided, snapshot) =>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <Row className="rows-section">
                                <Col span={9}><Input value={section.title} placeholder="Titulo de la sección" onChange={(e) => handleChangeTitle(index, e.target.value)} onBlur={handleBlurTitle}/></Col>
                                <Col span={6}>
                                  { getTypeSection(section.type)}
                                </Col>
                                <Col span={3} className="center"><Checkbox checked={section.status === 'ACTIVE'} onChange={(e) => changeActiveSection(index, e.target.checked)}/></Col>
                                <Col span={3} className="center"><Checkbox checked={section.prefilled === true} onChange={(e) => changePrefillSection(index, e.target.checked)}/></Col>
                                <Col span={2} className="tools">
                                  <Tooltip title="Modificar">
                                    <Button icon="edit" size="small" disabled={section.type === null || section.type === undefined} onClick={(e) => editSection(section)}/>
                                  </Tooltip>
                                  <Popconfirm title="Confirma eliminar la Sección?" onConfirm={(e) => deleteSection(index)}>
                                    <Button icon="delete" size="small" />
                                  </Popconfirm>
                                </Col>
                                <Col span={1} className="drag-area"><Icon type="drag"/></Col>
                              </Row>
                            </div>
                          }
                        </Draggable>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
            : mode === 'design' ?
              <FormEdit key={keyForm} form={form} refreshSection={refreshSection} setForm={setForm} />
            :
              <Preview form={form} closeModalHandler={closeModalHandler} />
            }

            { isVisiblePreview &&
              <Modal
                className="preview-modal"
                title="Vista Previa"
                footer={ null }
                visible={ true }
                onOk={ closeModalHandler  }
                onCancel={ closeModalHandler }
                style={{ top: 20 }}
                key={keyForm}
              >
                <div>
                  <Preview form={form} closeModalHandler={closeModalHandler} />
                </div>
              </Modal>
            }
            { isVisibleNewSection &&
              <Modal
                title="Nueva Sección"
                className="modal-new-section"
                footer={ null }
                visible={ true }
                onOk={ closeModalSectionHandler  }
                onCancel={ closeModalSectionHandler }>
                  <ModalNewSection handlerAddSection={handlerAddSection} />
              </Modal>
            }
          </div>
          }
        </>
      }
    </div>
  )
}
export default FormDetail;
