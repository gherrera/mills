import './Filter.scss'
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Tabs,
  Input,
  Tooltip,
  Button,
  Select,
  DatePicker
} from "antd";

import moment from "moment";

import { getUsersByClientPromise } from '../../../../../../promises';
import { getFormNamesPromise } from './promises';

const { TabPane } = Tabs;

const Filter = ({cbFilters}) => {
    const [users, setUsers] = useState([])
    const [formNames, setFormNames] = useState([])
    const [advancedObj, setAdvancedObj] = useState({});
    const [advancedObjMenu, setAdvancedObjMenu] = useState({
        m1: {},
        m2: {},
        m3: {},
        m4: {},
      });

    useEffect(() => {
        getUsersByClientPromise().then((response) => {
            setUsers(response)
        })
        getFormNamesPromise().then((response) => {
            setFormNames(response)
        })
    }, [])

    const handlerChange = (menu, field, value, enter) => {
        const obj = { ...advancedObj, [field]: value };
        if (value === null || value === "" || value === undefined) {
            delete obj[field];
        }
        setAdvancedObj(obj);
        if (enter) {
            let objMenu = advancedObjMenu[menu];
            const obj2 = { ...objMenu, [field]: value };
            if (value === null || value === "" || value === undefined) {
               delete obj2[field];
            }
            const obj3 = { ...advancedObjMenu, [menu]: obj2 };

            cbFilters(obj);
            setAdvancedObjMenu(obj3);
        }
    };

    const enterHandler = (menu, field, value) => {
        handlerChange(menu, field, value, true);
    };
    
    const handleClear = () => {
        setAdvancedObj({});
        setAdvancedObjMenu({ m1: {}, m2: {}, m3: {}, m4: {} });
        cbFilters({});
    };
    
    return (
        <div className="advanced-tab-manage">
            <Tooltip title="Borrar Filtros">
                <Button
                    icon="delete"
                    className="btn-clear"
                    shape="circle"
                    ghost
                    onClick={handleClear}
                />
            </Tooltip>
            <Tabs>
                <TabPane tab="Persona" key="1">
                    <Row gutter={10}>
                        <Col span={6}>
                            <Input
                                size="small"
                                placeholder={"Nombre o Nro de Documento"}
                                value={advancedObj.rutNombre}
                                onChange={(e) => {handlerChange("m1", "rutNombre", e.target.value, false)}}
                                onPressEnter={(e) => enterHandler("m1", "rutNombre", e.target.value)}
                            />
                        </Col>
                        <Col span={4}>
                            <Select 
                                placeholder="Tipo de Persona"
                                size="small"
                                allowClear
                                value={advancedObj.tipoPersona}
                                onChange={(value) => handlerChange("m1", "tipoPersona", value, true)}
                            >
                                <Select.Option value="PN">Natural</Select.Option>
                                <Select.Option value="PJ">Jurídica</Select.Option>
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Input
                                size="small"
                                placeholder={"Email"}
                                value={advancedObj.email}
                                onChange={(e) => handlerChange("m1", "email", e.target.value, false)}
                                onPressEnter={(e) => enterHandler("m1", "email", e.target.value)}
                            />
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Formularios" key="2">
                    <Row gutter={10}>
                        <Col span={4}>
                            <Select 
                                placeholder="Categoría"
                                size="small"
                                allowClear
                                value={advancedObj.category}
                                onChange={(value) => handlerChange("m2", "category", value, true)}
                            >
                                <Select.Option value="CLIENTE">Cliente</Select.Option>
                                <Select.Option value="COLABORADOR">Colaborador</Select.Option>
                                <Select.Option value="PROVEEDOR">Proveedor</Select.Option>
                                <Select.Option value="DIRECTOR">Director</Select.Option>
                            </Select>
                        </Col>
                        <Col span={6}>
                            <Select
                                showSearch
                                size="small"
                                placeholder="Nombre Formulario"
                                value={advancedObj.formName}
                                allowClear
                                onChange={(value) => handlerChange("m2", "formName", value, true)}
                            >
                                {formNames.map((name) => <Select.Option value={name}>{name}</Select.Option>)}
                            </Select>
                        </Col>
                        <Col span={4}>
                            <DatePicker.RangePicker
                                size="small"
                                placeholder={["F. Recepción", "Hasta"]}
                                format = 'DD/MM/YYYY'
                                style={{ width: "100%" }}
                                value={
                                advancedObj.fechaRecepcion
                                    ? [
                                        moment(advancedObj.fechaRecepcion[0]),
                                        moment(advancedObj.fechaRecepcion[1]),
                                    ]
                                    : null
                                }
                                onChange={(momentObj) => 
                                handlerChange(
                                    "m2",
                                    "fechaRecepcion",
                                    momentObj !== null && momentObj.length === 2
                                    ? [
                                        moment(momentObj[0]).valueOf(),
                                        moment(momentObj[1]).valueOf(),
                                        ]
                                    : null,
                                    true
                                )
                                }
                            />
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Datos Opcionales" key="3">
                    <Row gutter={10}>
                        <Col span={4}>
                            <Input
                                size="small"
                                placeholder={"Empresa"}
                                value={advancedObj.empresa}
                                onChange={(e) => handlerChange("m3", "empresa", e.target.value, false)}
                                onPressEnter={(e) => enterHandler("m3", "empresa", e.target.value)}
                            />
                        </Col>
                        <Col span={4}>
                            <Input
                                size="small"
                                placeholder={"Gerencia"}
                                value={advancedObj.gerencia}
                                onChange={(e) => handlerChange("m3", "gerencia", e.target.value, false)}
                                onPressEnter={(e) => enterHandler("m3", "gerencia", e.target.value)}
                            />
                        </Col>
                        <Col span={4}>
                            <Input
                                size="small"
                                placeholder={"Area"}
                                value={advancedObj.area}
                                onChange={(e) => handlerChange("m3", "area", e.target.value, false)}
                                onPressEnter={(e) => enterHandler("m3", "area", e.target.value)}
                            />
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Comentarios" key="4">
                    <Row gutter={10}>
                        <Col span={4}>
                            <Select 
                                    placeholder="Usuario"
                                    size="small"
                                    allowClear
                                    value={advancedObj.userIdComment}
                                    onChange={(value) => handlerChange("m4", "userIdComment", value, true)}
                                >
                                {users.map((user) => <Select.Option value={user.id}>{user.name}</Select.Option>)}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <DatePicker.RangePicker
                                size="small"
                                placeholder={["F. Ultimo Comentario", "Hasta"]}
                                format = 'DD/MM/YYYY'
                                style={{ width: "100%" }}
                                value={
                                advancedObj.fecLastComment
                                    ? [
                                        moment(advancedObj.fecLastComment[0]),
                                        moment(advancedObj.fecLastComment[1]),
                                    ]
                                    : null
                                }
                                onChange={(momentObj) => 
                                handlerChange(
                                    "m4",
                                    "fecLastComment",
                                    momentObj !== null && momentObj.length === 2
                                    ? [
                                        moment(momentObj[0]).valueOf(),
                                        moment(momentObj[1]).valueOf(),
                                        ]
                                    : null,
                                    true
                                )
                                }
                            />
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </div>
    )
}
export default Filter;
