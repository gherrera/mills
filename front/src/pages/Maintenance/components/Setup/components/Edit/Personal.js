import './Personal.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd'
import { Step4 } from '..'
import { getUsersByClientPromise } from '../../../../../../promises'

const Personal = ({molino, action, readOnly, mode, handleChangePersonal }) => {
    const [personal, setPersonal] = useState(null)
    const [usuarios, setUsuarios] = useState([])
    const [ showAll, setShowAll ] = useState(action !== 'STARTED' && action !== 'FINISHED')

  useEffect(() => {
    let personas = []
    molino.turns.map(t => {
        t.personas.map(p => {
            personas.push({...p, turno: t.name})
        })
    })
    setPersonal(personas)
    getUsersByClientPromise().then(users => setUsuarios(users))
  }, [])

  const handleNotifPersonal = (p) => {
    setPersonal(p)
    handleChangePersonal(p)
  }

  const toogleShowAll = () => {
    setShowAll(!showAll)
  }

  return (
    <div className='personal'>
        <Row className="title">
            <Col span={18}>Datos del personal que ocupará cada turno de trabajo</Col>
            {(action === 'STARTED' || action === 'FINISHED') &&
                <Col span={6} className="ver-mas" onClick={toogleShowAll}>
                    <a>{showAll? "Ver menos" : "Ver más"}</a>
                </Col>
            }
        </Row>
        { personal && showAll &&
            <Step4 key={mode} personal={personal} usuarios={usuarios} notifPersonal={handleNotifPersonal} mode={mode} />
        }
    </div>
  )
}

export default Personal;
