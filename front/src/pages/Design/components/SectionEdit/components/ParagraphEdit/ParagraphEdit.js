import "./ParagraphEdit.scss";
import React, { useEffect, useState } from "react";
import {
  Input
} from "antd";

import { useTranslation } from "react-i18next";
import { FieldSetEdit } from '../'

const { TextArea } = Input;

const ParagraphEdit = ({ section, component, fieldset, handleChangeValuesSection }) => {
  const { t } = useTranslation()

  useEffect(() => {
  }, [])

  const handleChangeText = (value) => {
    component.text = value
    handleChangeValuesSection(section)
  }

  return (
    <div className="paragraph-edit">
        <TextArea rows={5} value={component.text} placeholder="Ingrese aqui el texto del parrafo" onChange={(e) => handleChangeText(e.target.value)}/>
        { fieldset && 
          <>
            <h3>Agregar datos opcionales (Deben ser incluidos con el número del campo entre &lt;&gt;, Ej. &lt;1&gt; )</h3>
            <FieldSetEdit hasHeader={false} section={section} component={component} fieldset={fieldset} handleChangeValuesSection={handleChangeValuesSection} />
          </>
        }
    </div>
  )
}

export default ParagraphEdit;