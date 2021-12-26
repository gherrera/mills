import "./Preview.scss";
import React, { useEffect, useState } from "react";
import {
  Radio,
  Spin
} from "antd";
import { Section } from '../../../FormDeclaration/components'
import { FormDeclaration } from '../../../'
import { getJsonSectionPromise, getJsonFormPromise } from './promises'

import { useTranslation } from "react-i18next";

const Preview = ({ form, section }) => {
  const { t } = useTranslation()
  const [ mode, setMode ] = useState("preview")
  const [ json, setJson ] = useState({})
  const [ formPreview, setFormPreview ] = useState(null)
  const [ isLoading, setIsLoading ] = useState(false)

  useEffect(() => {    
    if(form) {
      let f = { ...form, sections: form.sections.filter(s => s.status === 'ACTIVE')}
      setFormPreview(f)
    }
  }, [])

  const handleChangeMode = (value) => {
    setMode(value)
    if(value === 'json') {
      setIsLoading(true)
      if(formPreview) {
        getJsonFormPromise(formPreview).then(response => {
          setJson(response)
          setIsLoading(false)
        })
      }else {
        getJsonSectionPromise(section).then(response => {
          setJson(response)
          setIsLoading(false)
        })
      }
    }
  }

  return (
    <div className={'preview-content preview-content-'+(form ? 'form' : 'section')}>
        <div className="preview-mode">
            <Radio.Group value={mode} size="small" buttonStyle="solid" onChange={(e) => handleChangeMode(e.target.value)}>
                <Radio.Button value="preview">HTML</Radio.Button>
                <Radio.Button value="pdf">PDF</Radio.Button>
                <Radio.Button value="json">JSON</Radio.Button>
            </Radio.Group>
        </div>
        { mode !== 'json' ?
        <>
            { formPreview && <FormDeclaration form={formPreview} mode={mode} /> }
            { section && <Section section={section} mode={mode} /> }
        </>
        :
        <pre className="preview-pdf">
          {
          isLoading ? <Spin size="large" />
          :
            <code>
              {JSON.stringify(json, null, 2)}
            </code>
          }
        </pre>
        }
    </div>
  )
}

export default Preview;
