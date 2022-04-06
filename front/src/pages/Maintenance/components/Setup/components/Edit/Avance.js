import './Avance.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import AvanceFase from './AvanceFase'

const Avance = ({molino, action }) => {
    //const { t } = useTranslation()

  useEffect(() => {
    
  }, [])

  function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    /*
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (":") : "";
    var mDisplay = m > 0 ? m + (":") : "";
    var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
    */
    return zeroPad(h,2)+":"+zeroPad(m,2); 
  }


  return (
    <div className='avance'>
        <Row className="title">
            <Col span={6}>Registro de avance</Col>
            <Col span={18} className="indicadores">
              <label>Inicio</label>
              <span>{moment(molino.startDate).format('DD/MM/YYYY HH:mm')}</span>

              <label>Fin</label>
              <span>
                { molino.status === 'FINISHED' ?
                  moment(molino.finishDate).format('DD/MM/YYYY HH:mm')
                :
                'N/A'
                }
              </span>

              <label>Tiempo total</label>
              <span>{secondsToHms(molino.realDuration)}</span>
            </Col>
        </Row>
        <Row className="indicators">
            <div className="indicator">
                <div className="content-indicator">
                  <div>Total de piezas</div>
                  {molino.piezas} piezas
                </div>
            </div>
            <div className="indicator">
              <div className="content-indicator">
                <div>Avance en horas</div>
                {secondsToHms(molino.duration)} horas
              </div>
            </div>
            <div className="indicator">
              <div className="content-indicator">
                <div>Piezas en movimiento</div>
                {molino.totalMontadas}/{molino.piezas}
              </div>
            </div>
            <div className="indicator">
              <div className="content-indicator">
                <div>Estimación horas faltantes</div>
                { molino.totalMontadas > 0 ? secondsToHms(molino.duration*molino.piezas/molino.totalMontadas - molino.duration)
                :
                  'N/A'
                }
              </div>
            </div>
        </Row>
        { molino.stages.map(stage =>
          <AvanceFase stage={stage} molino={molino} />
        )}
    </div>
  )
}

export default Avance;
