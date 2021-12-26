import "./Validation.scss";
import React, { useEffect, useState, useContext } from "react";
import {
  Col,
  Row,
  Icon,
  Radio,
  Button,
  Form,
  InputNumber
} from "antd";

import { useTranslation } from "react-i18next";


const Validation = ({ field, handleClickSelect, closeModalHandler }) => {
	const { t } = useTranslation()
    const [ selectedValue, setSelectedValue ] = useState(field.validation ? field.validation.type : null )
    const [ decimals, setDecimals ] = useState(field.validation ? field.validation.decimals : null)
    const [ maxLength, setMaxLength ] = useState(field.validation ? field.validation.maxLength : null)

    const handleChangeValidation = (type) => {
        setSelectedValue(type)
        if(type && (type === 'percent' | type.startsWith('rut'))) {
            setMaxLength(null)
            setDecimals(null)
        }else if(type !== 'number' && type !== 'percent') {
            setDecimals(null)
        }
    }

    const handleClickSelectValidation = () => {
        handleClickSelect({ type: selectedValue, decimals, maxLength })
    }

    const handleChangeDecimals = (val) => {
        setDecimals(val)
    }

    const handleChangeMaxLength = (val) => {
        setMaxLength(val)
    }

    return (
        <Row className="validation-edit">
            <Row>
                <Form.Item label="Seleccionar Tipo de Dato">
                    <Radio.Group onChange={(e) => handleChangeValidation(e.target.value)} value={selectedValue}>
                        <Row className="row-validation">
                            <Col span={2}><Icon size="small" type="font-colors" /></Col>
                            <Col span={20}>Texto Libre</Col>
                            <Col span={2}><Radio value={null} /></Col>
                        </Row>
                        <Row className="row-validation">
                            <Col span={2}><Icon size="small" type="mail" /></Col>
                            <Col span={20}>Email</Col>
                            <Col span={2}><Radio value="email" /></Col>
                        </Row>
                        <Row className="row-validation">
                            <Col span={2}><Icon size="small" type="idcard" /></Col>
                            <Col span={20}>Rut (Persona Natural o Jurídica)</Col>
                            <Col span={2}><Radio value="rut" /></Col>
                        </Row>
                        <Row className="row-validation">
                            <Col span={2}><Icon size="small" type="idcard" /></Col>
                            <Col span={20}>Rut Persona Natural</Col>
                            <Col span={2}><Radio value="rutNat" /></Col>
                        </Row>
                        <Row className="row-validation">
                            <Col span={2}><Icon size="small" type="idcard" /></Col>
                            <Col span={20}>Rut Persona Jurídica</Col>
                            <Col span={2}><Radio value="rutEmp" /></Col>
                        </Row>
                        <Row className="row-validation">
                            <Col span={2}><Icon size="small" type="number" /></Col>
                            <Col span={20}>Número</Col>
                            <Col span={2}><Radio value="number" /></Col>
                        </Row>
                        <Row className="row-validation">
                            <Col span={2}><Icon size="small" type="percentage" /></Col>
                            <Col span={20}>Porcentaje</Col>
                            <Col span={2}><Radio value="percent" /></Col>
                        </Row>
                    </Radio.Group>
                </Form.Item>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item label="Largo máximo">
                        <InputNumber value={maxLength} min={1} max={500} step={1} onChange={handleChangeMaxLength} disabled={selectedValue && (selectedValue === 'percent' || selectedValue.startsWith('rut'))}/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Número de decimales">
                        <InputNumber min={0} max={5} step={1} disabled={selectedValue !== 'number' && selectedValue !== 'percent'} value={decimals} onChange={handleChangeDecimals}/>
                    </Form.Item>
                </Col>
            </Row>

            <Row className="tools-validation">
                    <Button onClick={closeModalHandler}>Cerrar</Button>
                    <Button type="primary" onClick={handleClickSelectValidation}>Aplicar</Button>
            </Row>
        </Row>
    )
}
export default Validation;