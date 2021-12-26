import "./Decision.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Radio,
  Button
} from "antd";

import { useTranslation } from "react-i18next";
import { Subsection } from '..'

const Decision = ({ section, component, mode, handleChangeValues, showErrors }) => {
  const [ error, setError ] = useState(null)

  const handleChangeDecision = (value) => {
    handleChangeValues && refreshSectionKey('decision', value)

    if(value && component.records && component.records.length === 0) {
      setError('Debe Agregar al menos 1 registro')
    }else {
      setError(null)
    }
  }

  const refreshSectionKey = (key, value, updateValues=true) => {
    component[key] = value
    handleChangeValues(component, updateValues)
  }

  return (
    <div className="decision-form">
      <Row className="header-table">
        { mode !== 'pdf' && error !== null && showErrors && <Row className="has-errors-fieldset">{error}</Row>}
        <Col span={22} style={{textAlign: 'justify'}}>
            {component.text}
        </Col>
        <Col span={2}>
            <Radio.Group value={component.decision} disabled={mode === 'pdf'} onChange={(e) => handleChangeDecision(e.target.value)} style={{float:'right'}}>
              <Radio className="radio-switch" value={true}>
                Sí
              </Radio>
              <Radio className="radio-switch" value={false}>
                No
              </Radio>
            </Radio.Group>
        </Col>
      </Row>
      { component.decision !== null &&
      <>
        { component.decision === true && component.compSi && component.compSi.components && component.compSi.components.length > 0 &&
          <Subsection section={section} component={component} subsection={component.compSi} mode={mode} showErrors={showErrors} handleChangeValues={handleChangeValues} />
        }
        { component.decision === false && component.compNo && component.compNo.components && component.compNo.components.length > 0 &&
          <Subsection section={section} component={component} subsection={component.compNo} mode={mode} showErrors={showErrors} handleChangeValues={handleChangeValues} />
        }
      </>
      }
    </div>
  )
}

export default Decision;
