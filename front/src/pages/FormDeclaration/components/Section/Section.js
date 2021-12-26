import "./Section.scss";
import React, { useEffect, useState } from "react";
import {
  Row,
  Input
} from "antd";
import { Paragraph, FieldSet, Table, Subsection, Text, Decision } from '../'
import { saveSectionValuesPromise } from "../../promises";

import { useTranslation } from "react-i18next";

const Section = ({ decl, section, mode, refreshForm, showErrors }) => {
  const { t } = useTranslation()
  const [ sSection, setSSection ] = useState(section)

  const refreshSection = (s, updateValues=true) => {
    setSSection(s)

    if(refreshForm) {
      let _d = { ...decl }
      let _sec = []
      _d.sections.map((sec, i) => {
        if(sec.id === s.id) {
          _sec.push(s)
        }else {
          _sec.push(sec)
        }
      })
      _d.sections = _sec
      refreshForm(_d)

      if(mode === 'html' && updateValues) {
        saveSectionValuesPromise(decl.id, s)
      }
     }
  }

  const handleChangeValues = (component, updateValues=true) => {
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
    refreshSection(_s, updateValues)
  }

  return (
    <div className={'section-content mode-'+mode}>
        <h4 className="section-title">{sSection.title}</h4>
        <div className="section-body">
        { sSection.components && sSection.components.map((component, index) =>
            ((component.type === 'PARAGRAPH' && component.text) || component.type !== 'PARAGRAPH') &&
              <Row className={'section-component section-component-type-'+component.type}>
                  { component.type === 'PARAGRAPH' &&
                      <Paragraph component={component} mode={mode} handleChangeValues={mode==="html" || mode==="preview" ? handleChangeValues:null} />
                  }
                  { component.type === 'FIELDSET' &&
                      <FieldSet section={sSection} parent={sSection} component={component} mode={mode} 
                        showErrors={showErrors}
                        handleChangeValues={mode==="html" || mode==="preview" ? handleChangeValues:null} 
                        validateForm={showErrors}
                      />
                  }
                  { (component.type === 'TABLE' || component.type === 'DECL') &&
                      <Table section={sSection} component={component} mode={mode} handleChangeValues={mode==="html" || mode==="preview" ? handleChangeValues:null} showErrors={showErrors} />
                  }
                  { component.type === 'TEXT' &&
                      <Text component={component} mode={mode} handleChangeValues={mode==="html" || mode==="preview" ? handleChangeValues:null} />
                  }
                  { component.type === 'SUBSECTION' &&
                    <Subsection section={section} component={component} subsection={component} mode={mode} showErrors={showErrors} handleChangeValues={handleChangeValues} />
                  }
                  { component.type === 'DECISION' &&
                    <Decision section={section} component={component} mode={mode} showErrors={showErrors} handleChangeValues={mode==="html" || mode==="preview" ? handleChangeValues:null} />
                  }
              </Row>
        )}
        </div>
    </div>
  )
}

export default Section;
