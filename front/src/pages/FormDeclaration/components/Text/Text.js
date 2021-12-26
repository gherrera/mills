import "./Text.scss";
import React, { useEffect, useState, useContext } from "react";
import {
  Input,
  Row,
  Col
} from "antd";

import { useTranslation } from "react-i18next";
const { TextArea } = Input;

const Text = ({ component, mode, handleChangeValues }) => {

    const handleChangeFieldValue = (component, value) => {
        component.value = value
        handleChangeValues && handleChangeValues(component)
      }

    return (
        <Row className="text-form">
            { component.hasTitle &&
                <Row className="text-title">
                    {component.title}
                </Row>
            }
            { mode !== 'pdf' ?
                <TextArea rows={4} value={component.value}
                    onChange={(e) => handleChangeFieldValue(component, e.target.value)}
                    style={{ width: "100%" }}
                    className={'field-section'+(component.required ? ' required':'')+(component.value ? ' withval':' noval')}
                />
                :
                <pre className="text">{component.value}</pre>
            }
        </Row>
    )
}
    
export default Text;    
