import "./FieldSet.scss";
import React, { useEffect, useState, useContext } from "react";
import {
  Col,
  Row,
  Input,
  DatePicker,
  Select,
  Form,
  Radio,
  Checkbox,
  Icon
} from "antd";

import { useTranslation } from "react-i18next";
import moment from "moment";
import { datasourcesContext } from '../../../../contexts'
import { validateRutHelper } from "../../helpers";

const FieldSet = ({ form, section, parent, component, mode, showErrors, handleChangeValues, validateForm, cleanFields }) => {
  const { t } = useTranslation()
  const { getFieldDecorator, validateFields, getFieldsError, setFieldsValue } = form;
  const [ hasErrors, setHasErrors ] = useState(false)
  const [ changes, setChanges ] = useState(false)
	const { datasources } = useContext(datasourcesContext)
  const formLayout = component.orientation ? component.orientation : "vertical"

  useEffect(() => {
    if(parent.id === section.id) {
      let errores = component.fields.filter(f => f.required && (f.value === null || f.value === ''));
      setHasErrors(errores.length > 0)
    }
    if(validateForm) {
      let ids = component.fields.map(f => f.id);
      validateFields(ids)
    }
}, [validateForm])

useEffect(() => {
  if(cleanFields) {
    component.fields && component.fields.map(field => {
      field.value = null
      setFieldsValue({[field.id]: null})
    })
  }
}, [cleanFields])

  const handleChangeFieldValue = (field, value) => {
    field.value = value
    if(parent.id === section.id) {
      let errores = component.fields.filter(f => f.required && (f.value === null || f.value === ''));
      setHasErrors(errores.length > 0)
    }
    setChanges(true)
    handleChangeValues(component)
  }

  const handleReadOnly = (field,readOnly)=>{
    field.readOnly = readOnly
    handleChangeValues(component)
  }

  const handleOnBlur = (field, readOnly) => {
    let ff = []
    ff.push(field.id)
    field.errors = null

    let _err = hasErrorsFn(getFieldsError(), field.id)
    if(_err) {
      field.errors = _err
      setHasErrors(true)
    }
    handleReadOnly(field, readOnly)
  }

  const getValuesFromDS = (field) => {
    if(field.source && field.source.indexOf(':') > 0) {
      let ds = field.source.split(':')
      if(datasources[ds[0]] && datasources[ds[0]][ds[1]]) {
        let datasource = datasources[ds[0]][ds[1]] 
        if(datasource.parent) {
          let parent = component.fields.find(f => f.source === ds[0]+':'+datasource.parent)
          if(parent) {
            return datasource.values.filter(v => v.parent == parent.value)
          }
        }
        return datasource.values
      }
    }
    return [{value: "No hay datos"}]
  }

  function hasErrorsFn(fieldsError, fieldId) {
    return fieldsError[fieldId];
  }

  const getValidator = (rule, value, callback, validation) => {
    if(value === null || value === '') callback()
    else {
      if(validation.type === 'number' || validation.type === 'percent') {
        value = value.replaceAll(',','.')
        let re = new RegExp('^\\s*(\\d+(\\.\\d{0,' + (validation.decimals ? validation.decimals : 0) + '})?)\\s*$')
        if(re.test(value)) {
          if(validation.type === 'percent' && parseFloat(value) > 100) {
            callback("Numero no puede ser mayor a 100");
          }else {
            callback()
          }
        }else {
          var ren = new RegExp('^\\s*(\\d+(\\.\\d{0,100})?)\\s*$')
          if(validation.decimals === 0 && ren.test(value)) {
            callback("Numero no permite decimales");
          }else {
            callback("Numero no válido");
          }
        }
      }else if(validation.type === 'rut' || validation.type === 'rutEmp' || validation.type === 'rutNat') {
        let type = ''
        if(validation.type === 'rutEmp') type = 'Entity'
        else if(validation.type === 'rutNat') type = 'Person'
        if(validateRutHelper(value, type)) {
          callback()
        }else {
          if(validation.type === 'rut') {
            callback("Rut no válido");
          }else if(validation.type === 'rutEmp' && validateRutHelper(value)) {
            callback("Rut de Empresa no válido");
          }else if(validation.type === 'rutNat' && validateRutHelper(value)) {
            callback("Rut de Persona no válido");
          }else {
            callback("Rut no válido");
          }
        }
      }
    }
  }

  const formItemLayout =
      formLayout === 'horizontal'
        ? {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
          }
        : null;

  const getDefaultValue = (field) => {
    if(field.value !== null && field.value !== undefined && field.value !== '') {
      if(field.typeField === 'DATE') return moment(field.value, 'DD/MM/YYYY')
      else if(field.typeField === 'CHKOPTS') return field.value.split(',')
      else if(field.typeField === 'RADIOOTHER' && field.value.startsWith('OTHER-')) return 'OTHER'
    }
    return field.value
  }

  return (
    <div className={'fieldset '+section.type}>
      { mode !== 'pdf' && showErrors && hasErrors &&
        <Row className="has-errors-fieldset">
          { (component.fields.filter(f => f.required && (f.value === null || f.value === '')).length > 0) ?
           'Faltan campos requeridos'
           :
           'Hay errores en los datos'
          }
        </Row>
      }
      { component.hasTitle &&
        <Row className="fieldset-title">
          {component.title}
        </Row>
      }
      { component.fields &&
        <Row className="fields-fieldset" gutter={12}>
          <Form layout={formLayout === 'horizontal' ? 'horizontal':null} className={'formLayout-'+formLayout}>
          { component.fields.map(field =>
            <Col span={24/component.cols}>
              <Form.Item label={field.title} {...formItemLayout}>
                { mode === 'pdf' && field.typeField !== 'CHECKBOX' && field.typeField !== 'RADIO' && field.typeField !== 'RADIOOTHER' && field.typeField !== 'CHKOPTS' ?
                  <Input disabled={true} value={field.value} 
                    suffix={field.validation && field.validation.type === 'percent' ? <Icon type="percentage" />: null}
                  />
                  :
                  <>
                    { getFieldDecorator(field.id, {
                      initialValue: getDefaultValue(field),
                      validateTrigger: "onChange",
                      rules:
                        [
                          { required: mode !== 'pdf' && field.required, message: 'Campo requerido' },
                          ... field.validation && field.validation.type === 'email' ? [{type: "email", message: "Email no es válido"}]: [],
                          ... field.validation && (field.validation.type === 'number' || field.validation.type === 'rut' || field.validation.type === 'rutEmp' || field.validation.type === 'rutNat' || field.validation.type === 'percent') ? [{validator: (rule, value, callback) => getValidator(rule, value, callback, field.validation)}]: [],
                        ]
                    })(
                      field.typeField === 'INPUT' ?
                        <Input
                          autoComplete="off"
                          onFocus= {(e)=>handleChangeValues && handleReadOnly(field,false)}
                          onBlur= {(e)=>handleChangeValues && handleOnBlur(field,true)}
                          readOnly = {field.readOnly !== false}
                          maxLength={field.validation && field.validation.maxLength ? field.validation && field.validation.maxLength : 500}
                          onChange={(e) => handleChangeValues && handleChangeFieldValue(field, e.target.value)}
                          suffix={field.validation && field.validation.type === 'percent' ? <Icon type="percentage" />: null}
                        />
                      : field.typeField === 'SELECT' ?
                        <Select
                          showSearch
                          onFocus= {(e)=>handleChangeValues && handleReadOnly(field,false)}
                          onBlur= {(e)=>handleChangeValues && handleReadOnly(field,true)}
                          readOnly = {field.readOnly !== false}
                          onChange={(value) => handleChangeValues && handleChangeFieldValue(field, value)}>
                            { getValuesFromDS(field).map(val =>
                              <Select.Option value={val.value}>{val.value}</Select.Option>
                            )}
                        </Select>
                      : field.typeField === 'RADIO' || field.typeField === 'RADIOOTHER' ?
                        <Radio.Group
                          onChange={(e) => handleChangeValues && mode !== 'pdf' && handleChangeFieldValue(field, e.target.value)}>
                            { getValuesFromDS(field).map(val =>
                              <Radio value={val.value}>{val.value}</Radio>
                            )}
                            {  field.typeField === 'RADIOOTHER' && mode === 'pdf' && field.value && field.value.startsWith('OTHER') &&
                              <Radio value="OTHER">{field.value.substring(6)}</Radio>
                            }
                            { field.typeField === 'RADIOOTHER' && mode !== 'pdf' &&
                              <>
                              { field.value && field.value.startsWith('OTHER') ?
                                <Radio value="OTHER"/>
                                :
                                <Radio value="OTHER">Otro</Radio>
                              }
                              </>
                            }
                        </Radio.Group>
                      : field.typeField === 'CHECKBOX' ?
                        <Checkbox checked={field.value}
                          onChange={(e) => handleChangeValues && mode !== 'pdf' && handleChangeFieldValue(field, e.target.checked)}
                        />
                      : field.typeField === 'CHKOPTS' ?
                        <Checkbox.Group
                          onChange={(values) => handleChangeValues && mode !== 'pdf' && handleChangeFieldValue(field, values.toString())}
                          options={getValuesFromDS(field).map(val => {return {label: val.value, value: val.value}})}
                          />
                      :
                        <DatePicker placeholder="Ingrese la fecha" 
                          format="DD/MM/YYYY"
                          onChange={(momentObj) => handleChangeValues && handleChangeFieldValue(field, momentObj ? moment(momentObj).format( "DD/MM/YYYY" ) : null ) } 
                        />
                    )
                    }
                    { mode !== 'pdf' && field.typeField === 'RADIOOTHER' && field.value && field.value.startsWith('OTHER') &&
                        <Input size="small" placeholder="Otro" value={field.value.substring(6)} style={{width:'150px'}} onChange={(e) => handleChangeValues && handleChangeFieldValue(field, 'OTHER-'+e.target.value)}/>
                    }
                  </>
                }
              </Form.Item>
            </Col>
            )
          }
          </Form>
        </Row>
      }
    </div>
  )
}

export default Form.create()(FieldSet);
