import './Programado.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd'
import { Step5 } from '..'

const Programado = ({molino, action, readOnly, mode, handleChangeProgramado, initForm }) => {
    const [ scheduled, setScheduled] = useState(molino.scheduled)
    const [ showAll, setShowAll ] = useState(action !== 'STARTED' && action !== 'FINISHED')

  useEffect(() => {
  }, [])

  const toogleShowAll = () => {
    setShowAll(!showAll)
  }
  
  const handleNotifSchedule = (s) => {
    setScheduled(s)
    handleChangeProgramado(s)
  }

  return (
    <div className='programado'>
        <Row className="title">
            <Col span={18}>Programación de Movimientos</Col>
            {(action === 'STARTED' || action === 'FINISHED') &&
                <Col span={6} className="ver-mas" onClick={toogleShowAll}>
                    <a>{showAll? "Ver menos" : "Ver más"}</a>
                </Col>
            }
        </Row>
        { showAll &&
        <>
          <Step5 key={mode} mode={mode} readOnly={readOnly} molino={molino} scheduled={scheduled} notifSchedule={handleNotifSchedule} initForm={initForm} />
        </>
        }
    </div>
  )
}

export default Programado;