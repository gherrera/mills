import './Edit.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Row, Button } from 'antd'
import Client from './Client'
import Faena from './Faena'

const Edit = ({molino, action }) => {
  const [mode, setMode] = useState('view')
  const [readOnly, setReadOnly] = useState(true)
  const [cliente, setCliente] = useState(molino.faena.client)
  const [faena, setFaena] = useState(molino)

  useEffect(() => {

  }, [])

  const changeEdit = () => {
    setMode('edit')
    setReadOnly(false)
  }

  const saveFaena = () => {

  }

  const changeCliente = (c) => {
    setCliente(c)
  }

  const changeFaena = (f) => {
    setFaena(f)
  }

  return (
    <div className='edit'>
        { (action === 'new' || action === 'setup') &&
            <Row className="tools-btn">
                <Button disabled={mode === 'edit'} onClick={changeEdit} icon="edit">Modificar</Button>
                <Button disabled={mode === 'view'} onClick={saveFaena} icon="save">Guardar</Button>
            </Row>
        }
        <Row className="section">
            <Client key={action+"-"+mode} client={cliente} action={action} readOnly={readOnly} changeCliente={changeCliente} />
        </Row>
        <Row className="section">
            <Faena key={action+"-"+mode} molino={faena} action={action} readOnly={readOnly} changeFaena={changeFaena} />
        </Row>
    </div>
  )
}

export default Edit;
