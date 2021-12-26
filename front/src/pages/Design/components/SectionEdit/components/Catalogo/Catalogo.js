import "./Catalogo.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Checkbox,
  Icon,
  Tooltip,
  Switch,
  Button,
  Modal,
  Form,
  Input
} from "antd";

import { useTranslation } from "react-i18next";

const Catalogo = ({ section, catalogo, handleChangeCatalogoActive, handlerChangeCatalogo }) => {
  const { t } = useTranslation()
  const [ visibleAdd, setVisibleAdd ] = useState(false)
  const [ field, setField ] = useState(null)

  const handlerChangeCatalogoField = (field, attr, value) => {
    let _f = { ...field }
    _f[attr] = value
    if(attr === 'active' && value) _f.required=true
    handlerChangeCatalogo(catalogo, _f)
  }

  const changeCatalogoActive = (value) => {
      let cat = { ...catalogo, active: value}
      handleChangeCatalogoActive(cat)
  }

  const handleVisibleAdd = () => {
    setField({key: 'field'+(catalogo.fields.length+1), type: 'INPUT', active: true})
    setVisibleAdd(true)
  }

  const handleAddField = () => {
    let fields = catalogo.fields
    fields.push(field)
    let cat = { ...catalogo, fields}
    handleChangeCatalogoActive(cat)
    setVisibleAdd(false)
  }

  const handleChangeAttr = (attr, value) => {
    let f = { ...field, [attr]: value}
    setField(f)
  }

  const handleCancelNewField = () => {
    setField(null)
    setVisibleAdd(false)
  }

  return (
    <Row className="catalogo">
        <Row className="content">
            <Row>
                <Col className="title" span={22}>{catalogo.title}</Col>
                <Col span={2} className="switch-cat">
                    <Switch checked={catalogo.active} size="small" onChange={changeCatalogoActive}/>
                </Col>
            </Row>
            { catalogo.fields.map((field, index) =>
                <Col span={6} className={ catalogo.active ? "cat show " : "cat hide "}>
                    <Row className="field-cat">
                        <Col span={2} className="field-type">
                            <Tooltip title={field.type === 'INPUT' ? 'Texto editable' : field.type === 'SELECT' ? 'Desplegable' : 'Fecha'}>
                                <Icon size="small" type={field.type === 'INPUT' ? 'edit' : field.type === 'SELECT' ? 'unordered-list' : 'calendar'}/>
                            </Tooltip>
                        </Col>
                        <Col span={16}>{field.title}</Col>
                        <Col span={3}>
                            <Tooltip title="Activar"><Checkbox checked={field.active} size="small" disabled={!catalogo.active} onChange={(e) => handlerChangeCatalogoField(field, 'active', e.target.checked)} /></Tooltip>
                        </Col>
                        <Col span={3}>
                            <Tooltip title="Requerido"><Checkbox checked={field.active && field.required} disabled={!catalogo.active || !field.active} size="small" onChange={(e) => handlerChangeCatalogoField(field, 'required', e.target.checked)} /></Tooltip>
                        </Col>
                    </Row>
                </Col>
            )}
            { (section.type === 'CONTACTPERSON' || section.type === 'CONTACTENTITY') && catalogo.active &&
                <Col span={visibleAdd ? 6: 1} className={!visibleAdd ? 'btn-add-cat':'btn-new-field'}>
                    <Row className="field-cat">
                    { visibleAdd ?
                        <>
                            <Row>
                                <Col span={2} className="field-type">
                                    <Tooltip title={field.type === 'INPUT' ? 'Texto editable' : field.type === 'SELECT' ? 'Desplegable' : 'Fecha'}>
                                        <Icon size="small" type={field.type === 'INPUT' ? 'edit' : field.type === 'SELECT' ? 'unordered-list' : 'calendar'}/>
                                    </Tooltip>
                                </Col>
                                <Col span={16}><Input style={{width:'95%'}} size="small" value={field.title}  onChange={(e) => handleChangeAttr('title', e.target.value)}/></Col>
                                <Col span={3}>
                                    <Tooltip title="Activar"><Checkbox checked={field.active} size="small" disabled={true} onChange={(e) => handleChangeAttr('active', e.target.checked)} /></Tooltip>
                                </Col>
                                <Col span={3}>
                                    <Tooltip title="Requerido"><Checkbox checked={field.active && field.required} disabled={!catalogo.active || !field.active} size="small" onChange={(e) => handleChangeAttr('required', e.target.checked)} /></Tooltip>
                                </Col>
                            </Row>
                            <Row className="btns">
                                <Col span={10} offset={2}>
                                    <Button size="small" icon="check" onClick={handleAddField}>Agregar</Button>
                                </Col>
                                <Col span={10}>
                                    <Button size="small" icon="close" onClick={handleCancelNewField}>Cancelar</Button>
                                </Col>
                            </Row>
                        </>
                    :
                    <Tooltip title="Agregar dato"><Button icon="plus" size="small" type="primary" onClick={handleVisibleAdd}/></Tooltip>
                    }
                    </Row>
                </Col>
            }
        </Row>
    </Row>
  )
}

export default Catalogo;
