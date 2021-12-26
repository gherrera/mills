import "./FormDeclaration.scss";
import React, { useEffect, useState, useContext } from "react";
import {
  Col,
  Row,
  Button,
  notification,
  Modal
} from "antd";
import { Section } from './components'
import moment from "moment";

import { useTranslation } from "react-i18next";
import { datasourcesContext } from '../../contexts'
import apiConfig from '../../config/api'

const { confirm } = Modal;

const FormDeclaration = ({ form, mode, sendFormHandler, sending }) => {
  const { t } = useTranslation()
  const [decl, setDecl] = useState(form)
  const [ showErrors, setShowErrors ] = useState(false)
  const { loadFormDatasource } = useContext(datasourcesContext)

  useEffect(() => {
    loadFormDatasource(form.formParentId ? form.formParentId : form.id)
	}, [])

  const refreshForm = (f) => {
    setDecl(f)
  }

  const sendForm = () => {
    setShowErrors(false)
    let hasErrorsForm = false
    decl.sections.map(section => {
      let hasErrorsSection = false
      let descriptions = []
      section.components && section.components.map(component => {
        if(component.type === 'FIELDSET') {
          let errores = component.fields.filter(f => ((f.required && (f.value === null || f.value === '')) || f.errors) );
          if(errores.length > 0) {
            let title = component.title !== null && component.title !== '' ? component.title : section.title
            descriptions.push(<p>Faltan datos en la seccion {title}</p>)
            hasErrorsSection = true
          }
        }else if(component.type === 'DECL') {
          if(component.decision === null || component.decision === undefined) {
            hasErrorsSection = true
            descriptions.push(<p>Debe marcar una decisión en la seccion {section.title}</p>)
          }else if(component.decision && component.records.length === 0) {
            hasErrorsSection = true
            descriptions.push(<p>Debe agregar al menos 1 registro en la seccion {section.title}</p>)
          }
        }else if(component.type === 'PARAGRAPH') {
          let errores = component.fieldSet && component.fieldSet.fields && component.fieldSet.fields.filter(f => f.required && (f.value === null || f.value === ''));
          if(errores && errores.length > 0) {
            let title = component.title !== null && component.title !== '' ? component.title : section.title
            descriptions.push(<p>Faltan datos en la seccion {title}</p>)
            hasErrorsSection = true
          }
        }else if(component.type === 'FIELD') {
          if(component.required && (component.value === null || component.value === '')) {
            hasErrorsSection = true
          }
        }
      })
      if(hasErrorsSection) {
        hasErrorsForm = true
        /*
        notification.error({
          className: 'notif-error-required-fields',
          message: 'Faltan campos requeridos',
          description: descriptions
        })
        */
      }
    })
    if(hasErrorsForm) {
      setShowErrors(true)
      notification.error({
        className: 'notif-error-required-fields',
        message: 'Hay errores en el formulario',
        description: 'Faltan campos requeridos'
      })
    }else {
      confirm({
        title: 'Desea enviar la declaración?',
        onOk() {
          sendFormHandler()
        },
        onCancel() {
        },
      });

    }
  }

  const getLogoPosition = (logos, position) => {
    let pos = null
    logos && logos.map((logo) => {
        if(logo.position === position) pos = position
    })
    return pos
  }

  const getColLogo = (logos, position) => {
    return (
      <Col span={4} offset={position === 'LEFT' ? 0 : 6} className={position}>
          { getLogoPosition(logos, position) === position &&
              <img src={apiConfig.url +'/getLogoForm/'+(form.formParentId === null ?form.id : form.formParentId)+'/'+position+'?r='+Math.random()}/>
          }
      </Col>
    )
  }

  return (
    <div className="form-declaration">
      <div className="form-header">
        { form.logos !== null && form.logos.length > 0 &&
          <Row className="row-logo">
            { getColLogo(form.logos, 'LEFT') }
            { getColLogo(form.logos, 'CENTER') }
            { getColLogo(form.logos, 'RIGHT') }
          </Row>
        }
        <Row>
          <h2 className="form-title">{form.name}</h2>
        </Row>
        <Row>
          <Col span={12}>Fecha:&nbsp;&nbsp;<span className="inputHeader">{moment(form.creationDate).format('DD-MM-YYYY')}</span></Col>
          <Col span={12} style={{textAlign:'right', paddingRight:'20px'}}>
            Folio:&nbsp;&nbsp;<span className="inputHeader">{form.folio?form.folio:<>&nbsp;&nbsp;&nbsp;&nbsp;</>}</span>
          </Col>
        </Row>
      </div>
      <div className="form-content">
        { (form.formStatus !== 'SENT' || mode === 'pdf') && decl.sections && decl.sections.map(section =>
          <Section decl={decl} section={section} mode={mode} refreshForm={refreshForm} showErrors={showErrors} />
        )}
      </div>
      { mode !== 'pdf' && form.formStatus !== 'SENT'  &&
        <Row className="form-actions">
            <Col offset={20} span={4}>
              <Button onClick={sendFormHandler && sendForm} disabled={mode !== 'html' || sending} type="primary" size="large" style={{width:'150px'}} icon={sending?'loading':''}>Enviar</Button>
            </Col>
        </Row>
      }
    </div>
  )
}

export default FormDeclaration;
