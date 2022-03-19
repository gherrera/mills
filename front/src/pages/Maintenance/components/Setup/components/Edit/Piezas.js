import './Piezas.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd'
import { Step3 } from '..'

const Piezas = ({molino, action, readOnly, mode, handleChangePiezas }) => {
    const [ piezas, setPiezas] = useState(molino.parts)
    const [ nroPiezas, setNroPiezas] = useState(molino.parts.reduce((accumulator, current) => accumulator + current.qty, 0))
    const [ showAll, setShowAll ] = useState(action !== 'STARTED' && action !== 'FINISHED')

  useEffect(() => {
    
  }, [])

  const handleNotifPiezas = (p) => {
    setPiezas(p)
    handleChangePiezas(p)
  }

  const toogleShowAll = () => {
    setShowAll(!showAll)
  }

  return (
    <div className='piezas'>
        <Row className="title">
            <Col span={18}>Datos del equipo y las piezas que se reemplazarán</Col>
            {(action === 'STARTED' || action === 'FINISHED') &&
                <Col span={6} className="ver-mas" onClick={toogleShowAll}>
                    <a>{showAll? "Ver menos" : "Ver más"}</a>
                </Col>
            }
        </Row>
        { showAll &&
        <>
          <div className="info">{nroPiezas} pieza{nroPiezas !== 1 && 's'}</div>
          <Step3 key={mode} pieces={piezas} notifPiezas={handleNotifPiezas} mode={mode} />
        </>
        }
    </div>
  )
}

export default Piezas;
