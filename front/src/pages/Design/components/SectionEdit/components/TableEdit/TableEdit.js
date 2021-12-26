import "./TableEdit.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Radio,
  Input,
  Form
} from "antd";

import { useTranslation } from "react-i18next";
import { FieldSetEdit } from '..'

const { TextArea } = Input;

const Table = ({ section, component, fieldset, handleChangeValuesSection }) => {
	const { t } = useTranslation()

  useEffect(() => {
  }, [])

  const handleChangeText = (value) => {
    component.text = value
    handleChangeValuesSection(section)
  }

  return (
    <div className="comp-table-edit">
    { component.type === 'TABLE' &&
      <Row style={{marginBottom: '10px'}}>
        <Col span={24}>
          <Form.Item label="Texto sección">
              <TextArea value={component.text} rows={4} onChange={(e) => handleChangeText(e.target.value)}/>
          </Form.Item>
        </Col>
      </Row>
    }
    { component.type === 'DECL' &&
      <Row>
        <Col span={21}>
          <Form.Item label="Texto pregunta declaracion">
            <TextArea value={component.text} rows={4} onChange={(e) => handleChangeText(e.target.value)}/>
          </Form.Item>
        </Col>
        <Col span={2} offset={1}>
          <Form.Item label="Decisión">
            <Radio.Group disabled>
              <Radio className="radio-switch" value={true}>
                Sí
              </Radio>
              <Radio className="radio-switch" value={false}>
                No
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    }
    { fieldset && <FieldSetEdit section={section} component={component} fieldset={fieldset} handleChangeValuesSection={handleChangeValuesSection} /> }
    </div>
  )
}
export default Table;
