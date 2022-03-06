import './Avance.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd'

const Avance = ({molino, action }) => {
    const [piezas, setPiezas] = useState(molino.parts)

  useEffect(() => {
    
  }, [])

  return (
    <div className='avance'>
        <Row className="title">
            <Col span={18}>Registro de avance</Col>
            
        </Row>
    </div>
  )
}

export default Avance;
