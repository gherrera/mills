import './Edit.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Row, Button, notification, Modal } from 'antd'
import Client from './Client'
import Faena from './Faena'
import Personal from './Personal'
import Piezas from './Piezas'
import Avance from './Avance'

import { saveMolinoPromise, getMolinoPromise } from '../../../../promises'

const { confirm } = Modal;

const Edit = ({molino, action, loadMolinos }) => {
  const [mode, setMode] = useState('view')
  const [readOnly, setReadOnly] = useState(true)
  const [formCliente, setFormCliente] = useState(null)
  const [formFaena, setFormFaena] = useState()
  const [personal, setPersonal] = useState(null)
  const [piezas, setPiezas] = useState(null)
  const [ molinoVar, setMolinoVar ] = useState(molino)

  useEffect(() => {
    getMolinoPromise(molino.id).then(m => {
      setMolinoVar(m)
    })
  }, [])

  const changeEdit = () => {
    setMode('edit')
    setReadOnly(false)
  }

  const changeView = () => {
    setMode('view')
    setReadOnly(true)
  }

  function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }

  const saveFaena = async () => {
    let molinoObj = {...molinoVar}
    if(formCliente) {
      if(hasErrors(formCliente.getFieldsError())) {
        notification.error({
          message: 'Error',
          description: 'Hay errores en sección Cliente'
        })
        return false
      }else {
        const cli = formCliente.getFieldsValue()
        molinoObj.faena.client.name = cli.name
        molinoObj.faena.client.rut = cli.rut
        molinoObj.faena.client.address = cli.address
        molinoObj.faena.client.email = cli.email
        molinoObj.faena.client.contactName = cli.contactName
        molinoObj.faena.client.contactPhone = cli.contactPhone
      }
    }
    if(formFaena) {
      if(hasErrors(formFaena.getFieldsError())) {
        notification.error({
          message: 'Error',
          description: 'Hay errores en sección Faena'
        })
        return false
      }else {
        const fa = formFaena.getFieldsValue()
        molinoObj.faena.name = fa.faena
        molinoObj.ordenTrabajo = fa.ordenTrabajo
        molinoObj.type = fa.type
        molinoObj.name = fa.name
        molinoObj.hours = fa.hours
        molinoObj.exHours = fa.exHours
      }
    }
    if(personal) {
      let uniqTurnos = [...new Set(personal.map(item => item.turno))];
      let turns = []
      uniqTurnos.map(t => {
        let turno = {name: t}
        turno.personas = personal.filter(p => p.turno === t)
        turns.push(turno)
      })
      molinoObj.turns = turns
    }
    if(piezas) {
      molinoObj.parts = piezas
    }

    confirm({
      title: 'Guardar Datos',
      content: 'Confirma la modificación?',
      onOk() {
        saveMolinoPromise(molinoObj).then(m => {
          if(m) {
            notification.success({
              message: 'Modificación',
              description: 'Datos guardados exitosamente'
            })
            setMolinoVar(m)
            changeView()
            loadMolinos()
          }else {
            notification.error({
              message: 'Error',
              description: 'Ocurrió un error al grabar'
            })
          }
        })

      },
      onCancel() {},
    });
  }

  const initFormCliente = (c) => {
    setFormCliente(c)
  }

  const initFormFaena = (f) => {
    setFormFaena(f)
  }

  const handleChangePersonal = (p) => {
    setPersonal(p)
  }

  const handleChangePiezas = (p) => {
    setPiezas(p)
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
            <Client key={action+"-"+mode} client={molinoVar.faena.client} action={action} readOnly={readOnly} mode={mode} initFormCliente={initFormCliente} />
        </Row>
        <Row className="section">
            <Faena key={action+"-"+mode} molino={molinoVar} action={action} readOnly={readOnly} mode={mode} initFormFaena={initFormFaena} />
        </Row>
        <Row className="section">
            <Personal key={action+"-"+mode} molino={molinoVar} action={action} readOnly={readOnly} mode={mode} handleChangePersonal={handleChangePersonal} />
        </Row>
        <Row className="section">
            <Piezas key={action+"-"+mode} molino={molinoVar} action={action} readOnly={readOnly} mode={mode} handleChangePiezas={handleChangePiezas} />
        </Row>

        { (action === "STARTED" || action === "FINISHED") &&
          <Row className="section">
              <Avance key={action+"-"+mode} molino={molinoVar} action={action} />
          </Row>
        }
    </div>
  )
}

export default Edit;
