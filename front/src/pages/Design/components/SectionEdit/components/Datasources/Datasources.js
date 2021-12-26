import "./Datasources.scss";
import React, { useEffect, useState, useContext } from "react";
import {
  Col,
  Row,
  Select,
  Button,
  Input,
  Tooltip,
  Form,
  Table,
  Modal
} from "antd";

import { useTranslation } from "react-i18next";
import { datasourcesContext } from '../../../../../../contexts'
import { saveDataSourcePromise } from "../../promises";

const { Option, OptGroup } = Select;
const { TextArea } = Input;

const Datasources = ({ formId, field, handleClickSelect, closeModalHandler }) => {
	const { t } = useTranslation()
	const { datasources } = useContext(datasourcesContext)
    const { loadFormDatasource } = useContext(datasourcesContext)
    const [ editDS, setEditDS ] = useState(false)
    const [ selectedDS, setSelectedDS ] = useState(null)
    const [ textValues, setTextValues ] = useState(null)
    const [ enableSave, setEnableSave ] = useState(false)
    const [ isVisibleNew, setIsVisibleNew ] = useState(false)
    const [ selectedValueDS, setSelectedValueDS ] = useState(null)
    const [ valueNewDS, setValueNewDS ] = useState(null)
  
    useEffect(() => {
        if(field.source && field.source.indexOf(':') >0) {
            handleChangeDatasource(field.source)
        }
    }, [])

    const colsDS = [
        {
            title: 'Opciones',
            dataIndex: 'value'
        }
    ]
    
    const handleChangeDatasource = (value) => {
        let data = value.split(':')
        if(value === 'FORM:NEW') {
            setValueNewDS(null)
            setIsVisibleNew(true)
        }else {
            setSelectedDS(datasources[data[0]][data[1]])
        }
        setSelectedValueDS(value)
    }

    const handleEditDS = () => {
        if(!editDS) {
            setTextValues(getTextDS())
        }
        setEditDS(!editDS)
        setEnableSave(false)
    }

    const getTextDS = () => {
        let text = ''
        selectedDS && selectedDS.values && selectedDS.values.map((t,index) => {
            text += t.value
            if(index < (selectedDS.values.length-1)) text += '\n'
        })
        return text
    }

    const handleSaveDS = () => {
        let val = textValues.split('\n')
        let values = []
        val.map(v => {
            values.push({value: v})
        })
        let sDS = { ...selectedDS, values}

        let data = selectedValueDS.split(':')
        saveDataSourcePromise(formId, data[0], sDS).then(r => {
            setSelectedDS(sDS)
            handleEditDS()
            loadFormDatasource(formId)
        })
    }

    const handleChangeValues = (e) => {
        setTextValues(e.target.value)
        setEnableSave(true)
    }

    const closeModalNewHandler = (accept) => {
        setIsVisibleNew(false)
    }

    const handleChangeNewDS = (e) => {
        setValueNewDS(e.target.value)
    }

    const handleSaveNewDS = () => {
        saveDataSourcePromise(formId, 'FORM', {description: valueNewDS, values: []}).then(code => {
            loadFormDatasource(formId, () => {
                closeModalNewHandler()
                handleChangeDatasource('FORM:'+code)
                setEditDS(true)
            })
        })
    }

    return (
        <div className="datasources-edit">
            <Row>
              { datasources &&
              <>
                <Form.Item label="Seleccionar Fuente de Datos">
                    <Col span={21}>
                        <Select className="form-datasource" onChange={handleChangeDatasource} value={selectedValueDS} disabled={editDS}>
                            <OptGroup label="Mis datos">
                                <Option value={'FORM:NEW'}>+ Nuevo</Option>
                                { datasources.FORM && Object.values(datasources.FORM)
                                    .sort((a, b) => a.description > b.description ? 1 : -1)
                                    .map(ds =>
                                <Option value={'FORM:'+ds.code}>
                                    <Col span={22}>{ds.description}</Col>
                                    <Col span={2}>{ds.values.length}</Col>
                                </Option>            
                                )}
                            </OptGroup>
                            { datasources.CAT &&
                            <OptGroup label="Sistema">
                                { Object.values(datasources.CAT)
                                    .sort((a, b) => a.description > b.description ? 1 : -1)
                                    .map(ds =>
                                <Option value={'CAT:'+ds.code}>
                                    <Col span={22}>{ds.description}</Col>
                                    <Col span={2}>{ds.values.length}</Col>
                                </Option>            
                                )}
                            </OptGroup>
                            }
                        </Select>
                    </Col>
                    <Col span={3} className="tools-datasources">
                        { selectedDS && selectedValueDS !== 'FORM:NEW' &&
                            <>
                            { !editDS ?
                                <Tooltip title="Modificar opciones">
                                    <Button size="small" icon="edit" disabled={!selectedValueDS.startsWith('FORM')} onClick={handleEditDS}/>
                                </Tooltip>
                                :
                                <>
                                    { selectedValueDS && selectedValueDS.startsWith('FORM') &&
                                        <Tooltip title="Grabar">
                                            <Button size="small" icon="save" type="primary" onClick={handleSaveDS} disabled={!enableSave}/>
                                        </Tooltip>
                                    }
                                    <Tooltip title="Cancelar">
                                        <Button size="small" icon="close" onClick={handleEditDS}/>
                                    </Tooltip>
                                </>
                            }
                            </>
                        }
                    </Col>
                </Form.Item>
                { selectedDS && selectedValueDS !== 'FORM:NEW' && 
                <>
                    { editDS ?
                        <> 
                            <h4 className="title-datasource-values">Opciones</h4>
                            <TextArea rows={10} value={textValues} onChange={handleChangeValues} placeholder="Ingrese las opciones en lineas separadas"/>
                        </>
                    :
                        <Table columns={colsDS} size="small" dataSource={selectedDS && selectedDS.values} pagination={{ defaultPageSize: 5}}/>
                    }
                </>
                }
                <Row className="tools-datasource">
                    <Button onClick={closeModalHandler}>Cerrar</Button>
                    <Button type="primary" onClick={() => handleClickSelect(selectedValueDS)} disabled={editDS || !selectedDS || selectedValueDS === 'FORM:NEW'}>Aplicar</Button>
                </Row>
              </>
              }
            </Row>

            { isVisibleNew &&
                <Modal title="Nueva Lista de Datos"
                    className="modal-new-datasource"
                    footer={ null }
                    visible={ true }
                    onOk={ () => closeModalNewHandler(true)  }
                    onCancel={ () => closeModalNewHandler(false) }

                    >
                    <Form.Item label="Ingresar nombre">
                        <Input value={valueNewDS} onChange={handleChangeNewDS}/>
                    </Form.Item>
                    <Row className="tools-datasource">
                        <Button type="primary" onClick={handleSaveNewDS} disabled={valueNewDS === null || valueNewDS === ''} >Aceptar</Button>
                    </Row>
                </Modal>
            }
        </div>
    )
}
export default Datasources;
    