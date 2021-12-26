import "./Table.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Radio,
  Table as TableAntd,
  Descriptions,
  Button,
  notification
} from "antd";

import { useTranslation } from "react-i18next";
import { FieldSet } from '..'

const Table = ({ section, component, mode, handleChangeValues, showErrors }) => {
  const { t } = useTranslation()
  const [columns, setColumns] = useState([])
  const [fieldsPdf, setFieldsPdf] = useState({})
  const [ error, setError ] = useState(null)
  const [ validateForm, setValidateForm ] = useState(false)
  const [ cleanFieldsV, setCleanFieldsV ] = useState(null)

  useEffect(() => {
    let cols = []
    let fields = {}
    if(component.fieldSet && component.fieldSet.fields) {
      component.fieldSet.fields.map(field => {
        fields[field.key] = field
        if(field.tableVisible === true) {
          cols.push({
            title: field.title,
            dataIndex: field.key,
            render: (text, record, index) => {
              return record.fields[field.key]
            }
          })
        }
      })
    }
    if(mode !== 'pdf' && handleChangeValues) {
      cols.push({
        title: 'Acción',
        width: '80px',
        render: (text, record, index) => {
          return <Button icon="delete" size="small" onClick={() => removeRecord(index)} />
        }
      })
      verifyValidations()
    }else {
      setFieldsPdf(fields)
    }
    setColumns(cols)

  }, [mode])

  const verifyValidations = () => {
    if(component.type === 'DECL') {
      if((component.decision === null || component.decision === undefined) && mode === 'html') {
        setError('Debe marcar una decision')
      }else if(component.decision && component.records.length === 0) {
        setError('Debe Agregar al menos 1 registro')
      }else {
        setError(null)
      }
    }
  }

  const toDescriptionsPdf = (records) => (
    <>
      {records.map((record, index) => (
        <>
          <div className="descriptions-pdf">
            <h4 className="descriptions-numeral">#{index + 1}</h4>
            <Descriptions title="" column={1} bordered size="small">
              {Object.keys(fieldsPdf).map((key) => {
                return (
                  <Descriptions.Item label={fieldsPdf[key].title}>
                    {record.fields[key]}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </div>
          <br />
        </>
      ))}
    </>
  );

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

  const handleChangeValuesFn = (fieldSet) => {
    if(handleChangeValues) {
      refreshSectionKey('fieldSet', fieldSet, false)
      setValidateForm(false)
    }
  }

  const removeRecord = (index) => {
    let t = { ...component }
    let records = t.records
    records.splice(index, 1)
    refreshSectionKey('records', records)
    verifyValidations()
  }

  const addRecord = () => {
    setValidateForm(true)
    let emptys = component.fieldSet.fields.filter(f => f.required && (f.value===null || f.value===undefined || f.value===''))
    if(emptys.length > 0) {
      notification.error({
        message: 'Debe ingresar los campos requeridos'
      })
    }else {
      let errors = component.fieldSet.fields.filter(f => f.errors && f.errors.length > 0)
      if(errors.length > 0) {
        notification.error({
          message: 'Hay errores en los datos'
        })
      }else {
        let t = { ...component }
        let records = t.records ? t.records : []
        let fields = {}
        component.fieldSet.fields.map((f,index) => {
          fields[f.key] = f.value
        })
        records.push({fields})

        refreshSectionKey('records', records)
        verifyValidations();

        cleanFields()
      }
    }
    /*
    let ids = component.fieldSet.fields.map(f => f.id);
    validateFields(ids).then((error, values) => {
      
    })
    */
  }

  const getRandomId = () => {
    return 'R' + Math.floor(Math.random() * 1000000);
  }

  const cleanFields = () => {
    let fieldSet = { ...component.fieldSet }
    fieldSet.fields && fieldSet.fields.map(field => {
      field.value = null
    })
    setCleanFieldsV(getRandomId())

    handleChangeValuesFn(fieldSet)
  }

  return (
    <div className="table-form">
      { component.type === 'TABLE' &&
      <Row className="header-table">
        <Col span={24} style={{textAlign: 'justify'}}>
            {component.text}
        </Col>
      </Row>
      }
      { component.type === 'DECL' &&
      <Row className="header-table">
        { mode !== 'pdf' && error !== null && showErrors && <Row className="has-errors-fieldset">{error}</Row>}
        <Col span={22} style={{textAlign: 'justify'}}>
            {component.text}
        </Col>
        <Col span={2}>
            <Radio.Group value={component.decision} onChange={(e) => mode !== 'pdf' && handleChangeDecision(e.target.value)} style={{float:'right'}}>
              <Radio className="radio-switch" value={true}>
                Sí
              </Radio>
              <Radio className="radio-switch" value={false}>
                No
              </Radio>
            </Radio.Group>
        </Col>
      </Row>
      }
      { component.fieldSet && (component.type === 'TABLE' || component.decision === true) &&
      <>
        { mode !== 'pdf' &&
          <>
            <FieldSet section={section} 
              parent={component}
              component={component.fieldSet} 
              mode={mode} 
              showErrors={showErrors}
              handleChangeValues={handleChangeValuesFn} 
              validateForm={validateForm}
              cleanFields={cleanFieldsV}
            />
            <Row className="btns-table">
              <Button onClick={handleChangeValues && addRecord}>Añadir</Button>
              <Button onClick={handleChangeValues && cleanFields}>Limpiar</Button>
            </Row>
          </>
        }
        {(mode !== 'pdf' || columns.length === component.fieldSet.fields.length) ? 
          <>
          { component.records.length > 0 &&
          <TableAntd columns={columns} size="small" dataSource={component.records} pagination={component.records && component.records.size > 10 ? true : false} className="table-rows"/>
          }
          </>
          :
          toDescriptionsPdf(component.records)
        }
      </>
      }
    </div>
  )
}

export default Table;
