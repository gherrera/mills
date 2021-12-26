import "./Subsection.scss";
import React, { useEffect, useState } from "react";
import {
  Row
} from "antd";
import { Paragraph, FieldSet, Table, Text, Decision } from '..'

import { useTranslation } from "react-i18next";

const Subsection = ({ section, component, subsection, mode, showErrors, handleChangeValues }) => {
  const { t } = useTranslation()

  return (
    <div className={'subsection-content mode-'+mode}>
        { component.type === 'SUBSECTION' &&
          <h4 className="section-title">{subsection.title}</h4>
        }
        { subsection.components && subsection.components.length > 0 &&
          <div className="section-body">
          { subsection.components && subsection.components.map((component, index) =>
              ((component.type === 'PARAGRAPH' && component.text) || component.type !== 'PARAGRAPH') &&
                <Row className={'section-component section-component-type-'+component.type}>
                    { component.type === 'PARAGRAPH' &&
                        <Paragraph component={component} mode={mode} handleChangeValues={handleChangeValues} />
                    }
                    { component.type === 'FIELDSET' &&
                        <FieldSet section={section} parent={section} component={component} mode={mode} 
                          showErrors={showErrors}
                          handleChangeValues={handleChangeValues} 
                          validateForm={showErrors}
                        />
                    }
                    { (component.type === 'TABLE' || component.type === 'DECL') &&
                        <Table section={section} component={component} mode={mode} handleChangeValues={handleChangeValues} showErrors={showErrors} />
                    }
                    { component.type === 'TEXT' &&
                        <Text component={component} mode={mode} handleChangeValues={handleChangeValues} />
                    }
                    { component.type === 'DECISION' &&
                      <Decision section={section} component={component} mode={mode} showErrors={showErrors} handleChangeValues={handleChangeValues} />
                    }
                </Row>
          )}
          </div>
        }
    </div>
  )
}

export default Subsection;
