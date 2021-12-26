import "./Paragraph.scss";
import React, { useEffect, useState, useContext } from "react";
import {
  Row,
  Input,
  Select,
  DatePicker,
  Checkbox
} from "antd";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { datasourcesContext } from '../../../../contexts'

const Paragraph = ({ component, mode, handleChangeValues }) => {
  const { t } = useTranslation()
  const [ changes, setChanges ] = useState(false)
  const [ hasErrors, setHasErrors ] = useState(false)
	const { datasources } = useContext(datasourcesContext)

  useEffect(() => {
    if(component.fieldSet && component.fieldSet.fields) {
      let _fields = {}
      component.fieldSet.fields.map(field => {
        _fields[field.key] = field
      })

      let errores = component.fieldSet.fields.filter(f => f.required && (f.value === null || f.value === ''));
      setHasErrors(errores.length > 0)
    }
  }, [])

  const handleChangeFieldValue = (field, value) => {
    field.value = value
    handleChangeValues(component.fieldSet)
    let errores = component.fieldSet.fields.filter(f => f.required && (f.value === null || f.value === ''));
    setHasErrors(errores.length > 0)
    setChanges(true)
  }

  const handleReadOnly = (field,readOnly)=>{
    field.readOnly = readOnly
    handleChangeValues(component, false)
  }

  const getValuesFromDS = (field) => {
    if(field.source && field.source.indexOf(':') > 0) {
      let ds = field.source.split(':')
      if(datasources[ds[0]] && datasources[ds[0]][ds[1]]) {
        let datasource = datasources[ds[0]][ds[1]] 
        if(datasource.parent) {
          let parent = component.fieldSet.fields.find(f => f.source === ds[0]+':'+datasource.parent)
          if(parent) {
            return datasource.values.filter(v => v.parent == parent.value)
          }
        }
        return datasource.values
      }
    }
    return ["No hay datos"]
  }

  const getField = (field) => {
    if(field.typeField === 'INPUT' || (mode === 'pdf' && field.typeField !== 'CHECKBOX')) {
      return <Input size="small" className={'field-paragraph'+(mode !== 'pdf' && field.required ? ' required':'')+(field.value ? ' withval':' noval')} 
        disabled={mode === 'pdf'} 
        placeholder={field.title} 
        value={ field.value }
        autoComplete="off"
        onFocus= {(e)=>handleReadOnly(field,false)}
        onBlur= {(e)=>handleReadOnly(field,true)}
        readOnly = {field.readOnly !== false}
        onChange={(e) => handleChangeFieldValue(field, e.target.value)} />
    }else if(field.typeField === 'SELECT') {
      return <Select size="small" className={'field-paragraph'+(mode !== 'pdf' && field.required ? ' required':'')+(field.value ? ' withval':' noval')}
          showSearch
          placeholder={field.title} 
          value={field.value} 
          onFocus= {(e)=>handleReadOnly(field,false)}
          onBlur= {(e)=>handleReadOnly(field,true)}
          readOnly = {field.readOnly !== false}
          onChange={(value) => handleChangeFieldValue(field, value)}>
            { getValuesFromDS(field).map(val =>
              <Select.Option value={val.value}>{val.value}</Select.Option>
            )}
          </Select>
    }else if(field.typeField === 'CHECKBOX') {
      return <Checkbox 
       checked={field.value}
       disabled={mode === 'pdf'}
       onChange={(e) => handleChangeFieldValue(field, e.target.checked)}
      />
    }else {
      return <DatePicker size="small" className={'field-paragraph'+(mode !== 'pdf' && field.required ? ' required':'')+(field.value ? ' withval':' noval')}
      format="DD/MM/YYYY"
      placeholder={field.title}
      value={field.value && moment(field.value,"DD/MM/YYYY")}
      onChange={(momentObj) => handleChangeFieldValue(field, momentObj ? moment(momentObj).format( "DD/MM/YYYY" ) : null ) } />
    }
  }

  const  getText = (text) => {
    let p = []
    let lines = text.split('\n')
    lines.map(line => {
      let elems = []
      if(line === '') {
        elems.push(<span>&nbsp;</span>)
      }else {
        let data = line.split('<')
        data.map((el, index) => {
          if(el.indexOf('>') > 0) {
            let key = el.substring(0, el.indexOf('>'))
            let i = parseInt(key)
            if(!isNaN(i) && component.fieldSet && component.fieldSet.fields && component.fieldSet.fields[i-1]) {
              elems.push(getField(component.fieldSet.fields[i-1]))
              elems.push(<span>{el.substring(el.indexOf('>')+1)}</span>)
            }else {
              elems.push(<span>&lt;{el}</span>)
            }
          }else {
            elems.push(<span>{el}</span>)
          }
        })
      }
      p.push(<p>{elems}</p>)
    })
    return p
  }

  return (
    <div className="paragraph-form">
      { mode !== 'pdf' && changes && hasErrors && <Row className="has-errors-fieldset">Faltan campos requeridos</Row>}
      <Row className="paragraph-text">
        { component.text && getText(component.text) }
      </Row>
    </div>
  )
}

export default Paragraph;
