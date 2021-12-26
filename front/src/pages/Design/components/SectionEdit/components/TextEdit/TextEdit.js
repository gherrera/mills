import "./TextEdit.scss";
import React, { useEffect, useState } from "react";
import {
  Row,
  Input,
  Col,
  Checkbox
} from "antd";

const TextEdit = ({ section, component, handleChangeValuesSection }) => {

    const handlerChangeAttr = (attr, value) => {
        component[attr] = value
        handleChangeValuesSection(section)
      }

    return (
        <div className="row-component-text">
            <Row>
                <Col md={3} sm={4}>Título de los Datos</Col>
                <Col span={7}>
                    <Input value={component.hasTitle ? component.title : ''} onChange={(e) => handlerChangeAttr('title', e.target.value)} size="small" disabled={!component.hasTitle} />
                </Col>
                <Col span={1} className="chk-title">
                    <Checkbox checked={component.hasTitle} onChange={(e) => handlerChangeAttr('hasTitle', e.target.checked)} size="small" />
                </Col>
                <Col span={3}>Texto requerido</Col>
                <Col span={2}>
                    <Checkbox size="small" checked={component.required} onChange={(e) => handlerChangeAttr('required', e.target.checked)} />
                </Col>
            </Row>
        </div>
    )
}

export default TextEdit;
