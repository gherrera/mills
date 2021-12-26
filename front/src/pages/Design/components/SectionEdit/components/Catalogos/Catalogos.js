import "./Catalogos.scss";
import React, { useEffect, useState } from "react";
import { Catalogo } from "..";
import {
    Row,
    Col,
    Input,
    Button,
    Select
  } from "antd";

import { useTranslation } from "react-i18next";
const { Search } = Input;

const Catalogos = ({ handleChangeCatalogoActive, handlerChangeCatalogo, section, type, active=false, handleApplyFields, handleClose }) => {
  const { t } = useTranslation()
  const [catType, setCatType ] = useState(type)
  const [catalogos, setCatalogos ] = useState([])
  const [initCatalogos, setInitCatalogos ] = useState([])

  useEffect(() => {
      let catContacto = []
      if(catType === 'CONTACTPERSON') {
        let cat1 = {key: 'datosPersonales', hasTitle: true, title: 'Datos Personales', cols: 2, fields: [], active}
        cat1.fields.push({ type: 'INPUT', title: 'Nombre', key: 'nombre', active: false, required: false})
        cat1.fields.push({ type: 'INPUT', title: 'Ap Paterno', key: 'apPaterno', active: false, required: false})
        cat1.fields.push({ type: 'INPUT', title: 'Ap Materno', key: 'apMaterno', active: false, required: false})
        cat1.fields.push({ type: 'SELECT', title: 'Tipo de Documento', key: 'tipDoc', active: false, required: false, source:'CAT:TIPO_DOC'})
        cat1.fields.push({ type: 'INPUT', title: 'Documento', key: 'documento', active: false, required: false})
        cat1.fields.push({ type: 'SELECT', title: 'Nacionalidad', key: 'nacionalidad', active: false, required: false, source:'CAT:PAISES'})
        cat1.fields.push({ type: 'SELECT', title: 'Estado civil', key: 'estadoCivil', active: false, required: false, source:'CAT:ESTADO_CIVIL'})
        cat1.fields.push({ type: 'DATE', title: 'Fecha de nacimiento', key: 'fecNac', active: false, required: false})
        cat1.fields.push({ type: 'SELECT', title: 'Pais de residencia', key: 'paisResidencia', active: false, required: false, source:'CAT:PAISES'})
        cat1.fields.push({ type: 'SELECT', title: 'Pais de nacimiento', key: 'paisNacimiento', active: false, required: false, source:'CAT:PAISES'})
        cat1.fields.push({ type: 'SELECT', title: 'Parentesco', key: 'parentesco', active: false, required: false, source:'CAT:PARENTESCO'})
        catContacto.push(cat1)

        let cat2 = {key: 'contactoPersonal', hasTitle: true, title: 'Contacto personal', cols: 2, fields: [], active}
        cat2.fields.push({ type: 'INPUT', title: 'Correo electronico', key: 'email', active: false, required: false, validation: {type: 'email'}})
        cat2.fields.push({ type: 'INPUT', title: 'Telefono Fijo', key: 'telefono', active: false, required: false, validation: {maxLength: 12}})
        cat2.fields.push({ type: 'INPUT', title: 'Telefono Celular', key: 'celular', active: false, required: false, validation: {maxLength: 12}})
        catContacto.push(cat2)

        let cat3 = {key: 'direccionPersonal', hasTitle: true, title: 'Direccion personal', cols: 2, fields: [], active}
        cat3.fields.push({ type: 'SELECT', title: 'Region', key: 'region', active: false, required: false, source:'CAT:REGIONES'})
        cat3.fields.push({ type: 'SELECT', title: 'Comuna', key: 'comuna', active: false, required: false, source:'CAT:COMUNAS'})
        cat3.fields.push({ type: 'INPUT', title: 'Dirección', key: 'direccion', active: false, required: false, validation: {maxLength: 200}})
        cat3.fields.push({ type: 'INPUT', title: 'Numero de calle', key: 'numCalle', active: false, required: false, validation: {maxLength: 20}})
        cat3.fields.push({ type: 'INPUT', title: 'Numero de puerta', key: 'numPuerta', active: false, required: false})
        cat3.fields.push({ type: 'INPUT', title: 'Codigo postal', key: 'codPostal', active: false, required: false, validation: {maxLength: 10}})
        cat3.fields.push({ type: 'SELECT', title: 'Tipo de vivienda', key: 'tipVivienda', active: false, required: false, source:'CAT:TIPO_VIVIENDA'})
        catContacto.push(cat3)

        let cat4 = {key: 'ocupacion', hasTitle: true, title: 'Ocupación', cols: 2, fields: [], active}
        cat4.fields.push({ type: 'SELECT', title: 'Profesión', key: 'profesion', active: false, required: false, source:'CAT:PROFESIONES'})
        cat4.fields.push({ type: 'SELECT', title: 'Condición de Trabajo', key: 'condTrabajo', active: false, required: false, source:'CAT:COND_TRABAJO'})
        cat4.fields.push({ type: 'INPUT', title: 'Ocupación Actual', key: 'ocupacion', active: false, required: false})
        cat4.fields.push({ type: 'SELECT', title: 'Actividad Economica', key: 'actEconomica', active: false, required: false, source: 'CAT:ACTECO'})
        cat4.fields.push({ type: 'INPUT', title: 'Cargo que desempeña', key: 'cargo', active: false, required: false})
        catContacto.push(cat4)

        let cat5 = {key: 'infoEmpleador', hasTitle: true, title: 'Información Empleador', cols: 2, fields: [], active}
        cat5.fields.push({ type: 'INPUT', title: 'Nombre de la Empresa', key: 'empresa', active: false, required: false})
        cat5.fields.push({ type: 'INPUT', title: 'Antigüedad', key: 'antiguedad', active: false, required: false})
        cat5.fields.push({ type: 'SELECT', title: 'Región', key: 'region', active: false, required: false, source: 'CAT:REGIONES'})
        cat5.fields.push({ type: 'SELECT', title: 'Comuna', key: 'comuna', active: false, required: false, source:'CAT:COMUNAS'})
        cat5.fields.push({ type: 'INPUT', title: 'Dirección', key: 'direccion', active: false, required: false})
        cat5.fields.push({ type: 'INPUT', title: 'Numero de calle', key: 'numCalle', active: false, required: false})
        cat5.fields.push({ type: 'INPUT', title: 'Numero de puerta', key: 'numPuerta', active: false, required: false})
        cat5.fields.push({ type: 'INPUT', title: 'Codigo postal', key: 'codPostal', active: false, required: false})
        cat5.fields.push({ type: 'DATE', title: 'Fecha de inicio', key: 'fecInicio', active: false, required: false})
        cat5.fields.push({ type: 'DATE', title: 'Fecha de término', key: 'fecTermino', active: false, required: false})
        cat5.fields.push({ type: 'INPUT', title: 'Rut de la empresa', key: 'rutEmpresa', active: false, required: false, validation: {type: 'rutEmp'}})
        catContacto.push(cat5)

        let cat6 = {key: 'infoRemuneraciones', hasTitle: true, title: 'Información de Remuneraciones', cols: 2, fields: [], active}
        cat6.fields.push({ type: 'INPUT', title: 'Remuneración Mensual', key: 'remMensual', active: false, required: false, validation: {type: 'number', decimals: 0}})
        cat6.fields.push({ type: 'INPUT', title: 'Otros ingresos mensuales', key: 'otrosIngresosMensuales', active: false, required: false, validation: {type: 'number', decimals: 0}})
        catContacto.push(cat6)

        let cat7 = {key: 'infoPropiedades', hasTitle: true, title: 'Información de Propiedades', cols: 2, fields: [], active}
        cat7.fields.push({ type: 'INPUT', title: 'Nombre de Sociedad', key: 'nombreSociedad', active: false, required: false})
        cat7.fields.push({ type: 'SELECT', title: 'Tipo de Documento', key: 'tipoDocumento', active: false, required: false, source: 'CAT:TIPO_DOC'})
        cat7.fields.push({ type: 'INPUT', title: 'Documento Identidad', key: 'documento', active: false, required: false})
        cat7.fields.push({ type: 'INPUT', title: 'Cargo Ejercido', key: 'cargo', active: false, required: false})
        cat7.fields.push({ type: 'INPUT', title: 'Porcentaje de Participación', key: 'porcentaje', active: false, required: false, validation: {type: 'number', decimals: 2}})
        catContacto.push(cat7)
      }
      if(section && (section.type === 'CONTACTPERSON' || section.type === 'CONTACTENTITY')) {
        catContacto.map((seccion) => {
            section.components.map(comp => {
                if(comp.key === seccion.key) {
                    seccion.active = true
                    comp.fields.map(f => {
                      let existe = false
                      seccion.fields.map(fcat => {
                        if(fcat.key === f.key) {
                            fcat.active = true
                            fcat.required = f.required
                            existe = true
                        }
                      })
                      if(!existe) {
                        seccion.fields.push({
                          type: f.typeField, 
                          title: f.title, 
                          key: f.key, 
                          active: true, 
                          required: f.required
                        })
                      }
                    })
                }
            })
        })
      }

      setCatalogos(catContacto)
      setInitCatalogos(catContacto)
    }, [catType])

  const _handleChangeCatalogoActive = (cat) => {
    let cats = []
    catalogos.map((c, i) => {
      if(c.key === cat.key) {
        cats.push(cat);
      }else {
        cats.push(c);
      }
    })

    setCatalogos(cats)
    cats = []
    initCatalogos.map((c, i) => {
      if(c.key === cat.key) {
        cats.push(cat);
      }else {
        cats.push(c);
      }
    })

    setInitCatalogos(cats)
    if(handleChangeCatalogoActive) handleChangeCatalogoActive(cats)
  }

  const _handlerChangeCatalogo = (cat, field) => {
    let _c = []
    catalogos.map(c => {
      if(c.key === cat.key) {
        let _f = []
        c.fields.map(f => {
          if(f.key === field.key) {
            _f.push(field)
          }else {
            _f.push(f)
          }
        })
        c.fields = _f
      }
      _c.push(c)
    })
    setCatalogos(_c)
    if(handleChangeCatalogoActive) handlerChangeCatalogo(_c)

    _c = []
    initCatalogos.map(c => {
      if(c.key === cat.key) {
        let _f = []
        c.fields.map(f => {
          if(f.key === field.key) {
            _f.push(field)
          }else {
            _f.push(f)
          }
        })
        c.fields = _f
      }
      _c.push(c)
    })
    setInitCatalogos(_c)
  }

  const handleSearchField = (value) => {
    if(value === '') {
        setCatalogos(initCatalogos)
        if(handleChangeCatalogoActive) handlerChangeCatalogo(initCatalogos)
    } else {
        //setInitCatalogos(catalogos)
        let cat = []
        initCatalogos.map(c => {
            if(c.title.toLowerCase().includes(value.toLowerCase())) {
                c.active = true
                cat.push(c)
            }else {
                let _f = []
                c.fields.map(f => {
                    if(f.title.toLowerCase().includes(value.toLowerCase())) {
                      _f.push(f)
                    }
                })
                if(_f.length > 0) {
                    c.active = true
                    let _c = { ...c, fields: _f }
                    cat.push(_c)
                }
            }
        })
        setCatalogos(cat)
        if(handleChangeCatalogoActive) handlerChangeCatalogo(cat)
    }
  }

  const handleSendFields = () => {
    let fields = []
    catalogos.map(c => {
        fields.push( ...c.fields.filter(f => f.active))
    })
    handleApplyFields(fields)
  }

  return (
    <div className="catalogos">
        <Row>
            { type ? 
            <Col span={18}>
              <h4>Catalogo de datos{catType === "CONTACTPERSON" ? ' de Persona Natural' : catType === "CONTACTENTITY" ? ' de Persona Jurídica': ''}</h4>
            </Col>
            :
            <>
              <Col span={4}>
                <h4>Seleccionar Catálogo</h4>
              </Col>
              <Col span={4}>
                <Select onChange={(value) => setCatType(value)} size="small" style={{width:'100%'}}>
                  <Select.Option value="CONTACTPERSON">Persona Natural</Select.Option>
                  <Select.Option value="CONTACTENTITY">Persona Jurídica</Select.Option>
                </Select>
              </Col>
              <Col span={10}>
              </Col>
            </>
            }
            { handleApplyFields &&
              <Col span={6}>
                  <Search size="small" placeholder="Busque el nombre del campo" onChange={(e) => handleSearchField(e.target.value)} allowClear/>
              </Col>
            }
        </Row>
        <Row style={handleApplyFields && {paddingBottom:'20px'}}>
        { catalogos.map(cat =>
            <Catalogo section={section} catalogo={cat} handleChangeCatalogoActive={_handleChangeCatalogoActive} handlerChangeCatalogo={_handlerChangeCatalogo} />
        )}
        </Row>

        { handleApplyFields &&
            <div
                style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
                }}
            >
                <Button onClick={handleClose} style={{ marginRight: 8 }}>
                    Cancelar
                </Button>
                <Button onClick={handleSendFields} type="primary">
                    Agregar
                </Button>
            </div>
        }
    </div>
  )

}

export default Catalogos;
