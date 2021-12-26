import "./DecisionEdit.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Radio,
  Input,
  Form
} from "antd";

import { useTranslation } from "react-i18next";
import { SubsectionEdit } from '..'

const { TextArea } = Input;

const DecisionEdit = ({ section, component, handleChangeValuesSection, getComponentByType, getTooltipComponent }) => {
	const { t } = useTranslation()

  useEffect(() => {
  }, [])

  const handleChangeText = (value) => {
    component.text = value
    handleChangeValuesSection(section)
  }

  return (
    <div className="comp-decision-edit">
      <Row>
        <Col span={21}>
          <Form.Item label="Texto decisión">
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
      <Row>
        <Form.Item label="Elementos Sí">
          <SubsectionEdit section={section} component={component} subsection={component.compSi} 
                  handleChangeValuesSection={handleChangeValuesSection}
                  getComponentByType={getComponentByType} getTooltipComponent={getTooltipComponent} />
        </Form.Item>
      </Row>
      <Row>
        <Form.Item label="Elementos No">
          <SubsectionEdit section={section} component={component} subsection={component.compNo}
                  handleChangeValuesSection={handleChangeValuesSection}
                  getComponentByType={getComponentByType} getTooltipComponent={getTooltipComponent} />
        </Form.Item>
      </Row>

    </div>
  )
}
export default DecisionEdit;
