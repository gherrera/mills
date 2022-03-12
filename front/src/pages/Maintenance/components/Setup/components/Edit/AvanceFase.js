import './AvanceFase.scss'
import React, { useEffect, useState } from 'react'
import { Row, Col, Switch, Table } from 'antd'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons'

const AvanceFase = ({stage}) => {
    const { t } = useTranslation()
    const [checked, setChecked] = useState(true)

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
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (":") : "";
    var mDisplay = m > 0 ? m + (":") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return zeroPad(h,2)+":"+zeroPad(m,2); 
  }

  const onChangeSwitch = (chk) => {
    setChecked(chk)
  }

  const columnsStage = [
    {
      title: 'Proceso',
      dataIndex: 'task',
      width: '20px',
      render: (text) => t('messages.mills.task.'+text)
    },
    {
      title: 'Inicio',
      dataIndex: 'creationDate',
      width: '20%',
      render: (text) => moment(text).format("DD/MM/YYYY HH:mm")
    },
    {
      title: 'Fin',
      dataIndex: 'finishDate',
      width: '20%',
      render: (text) => text ? moment(text).format("DD/MM/YYYY HH:mm") : 'N/A'
    },
    {
      title: 'Total',
      dataIndex: 'duration',
      width: '20%',
      render: (text) => secondsToHms(text)
    },
    {
      title: 'Turno',
      dataIndex: 'turnoStart',
      width: '10%',
      render: (text, record) => {
        let turno = record.turnoStart.turno.name
        if(record.turnoFinish) turno = record.turnoFinish.turno.name
        if(turno === 'DAY') return <FontAwesomeIcon icon={faSun} />
        else return <FontAwesomeIcon icon={faMoon} />
      }
    },
    {
      title: 'Acciones',
      width: '10%',
      render: (text, record, index) => {
        return <div></div>
      }
    }
  ]

  return (
    <div className="stage">
        <Row className="title-stage">
          <Col span={6}>
            Fase {t('messages.mills.stage.'+stage.stage)}
          </Col>
          <Col span={18} className="data-title">
            <label>Inicio</label>
            <span className="info datetime">{moment(stage.creationDate).format("DD/MM/YYYY HH:mm")}</span>

            <label>Fin</label>
            <span className="info datetime">{stage.finishDate ? moment(stage.finishDate).format("DD/MM/YYYY HH:mm") : 'N/A'}</span>

            <label>Duración total</label>
            <span className="info duration">{secondsToHms(stage.duration)}</span>

            <label>Interrupciones</label>
            <span className="info interruption">{stage.events.length}</span>

            <Switch size="small" defaultChecked={checked} onChange={onChangeSwitch}/>
          </Col>
        </Row>
        { checked &&
          <Row className="data-table">
            <Table dataSource={stage.tasks} columns={columnsStage} size="small" pagination={stage.tasks.length > 10} />
          </Row>
        }
    </div>
  )
}

export default AvanceFase;
