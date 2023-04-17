import './Step5.scss'
import React, { useState, useEffect } from 'react'
import { Form, Button, Row, Col, Upload, Icon, Table, notification, Collapse, Input, Tooltip } from 'antd'
import { uploadSchedulePromise } from '../../../../promises'
import apiConfig from '../../../../../../config/api'
import { useTranslation } from 'react-i18next'
import { ReportService } from '../../../../../../services'

const { Panel } = Collapse;

function formatNumber(value) {
    value += '';
    const list = value.split('.');
    const prefix = list[0].charAt(0) === '-' ? '-' : '';
    let num = prefix ? list[0].slice(1) : list[0];
    let result = '';
    while (num.length > 3) {
      result = `,${num.slice(-3)}${result}`;
      num = num.slice(0, num.length - 3);
    }
    if (num) {
      result = num + result;
    }
    return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
  }
  
  class NumericInput extends React.Component {
    onChange = e => {
      const { value } = e.target;
      const reg = /^-?[0-9]*(\.[0-9]*)?$/;
      if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
        this.props.onChange(value);
      }
    };
  
    // '.' at the end or only '-' in the input box.
    onBlur = () => {
      const { value, onBlur, onChange } = this.props;
      let valueTemp = value;
      if (value.charAt(value.length - 1) === '.' || value === '-') {
        valueTemp = value.slice(0, -1);
      }
      onChange(valueTemp.replace(/0*(\d+)/, '$1'));
      if (onBlur) {
        onBlur();
      }
    };
  
    render() {
      const { value } = this.props;
      const title = value ? (
        <span className="numeric-input-title">{value !== '-' ? formatNumber(value) : '-'}</span>
      ) : (
        'Ingrese un número'
      );
      return (
        <Tooltip
          trigger={['focus']}
          title={title}
          placement="topLeft"
          overlayClassName="numeric-input"
        >
          <Input
            {...this.props}
            onChange={this.onChange}
            onBlur={this.onBlur}
            placeholder="Ingrese un número"
            maxLength={25}
          />
        </Tooltip>
      );
    }
}

const Step5 = ({ form, prevStep, saveFaena, mode, readOnly, molino, scheduled, notifSchedule, initForm }) => {
    const { getFieldDecorator, validateFields, getFieldsValue } = form;
    const [programacion, setProgramacion] = useState(scheduled)
    const [movimientos, setMovimientos] = useState(scheduled?.movs)
    const [fileList, setFileList] = useState([])
    const { t } = useTranslation()

    useEffect(() => {
        if(initForm) initForm(form)
    }, [])

    const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
    };

    const getTableColumns = () => {
        let columns = [
            {
                title: "Turno",
                dataIndex: "turn"
            },{
                title: "Hora / Correlativa",
                dataIndex: "corrHour"
            },{
                title: "Hora / Turno",
                dataIndex: "turnHour"
            },{
                title: "Unidad de Esfuerzo",
                dataIndex: "unit"
            },{
                title: "Movimientos Ejecución",
                dataIndex: "movs"
            },{
                title: "Total",
                dataIndex: "total"
            },{
                title: "Piezas montadas",
                dataIndex: "mounted"
            }
        ]

        return columns
    }

    const saveFaenaLocal = () => {
        if(!movimientos || movimientos.length === 0) {
          notification.error({
            message: 'Error',
            description: 'Agregar Movimientos Programados por Turno'
          })
        }else {
            validateFields(Object.keys(getFieldsValue())).then((p) => {
                const sche = { ...programacion, tasks: p}
                setProgramacion(sche)
                saveFaena(sche)
            })
        }
    }

    const prevStepLocal = () => {
        prevStep(programacion)
    }

    const getPropsUpload = () => {
        return {
          accept: ".xlsx",
          onRemove: file => {
          },
          beforeUpload: async (file) => {
            const formData = new FormData()
            formData.append('file', file)
    
            let resp = await uploadSchedulePromise(formData)
            if(resp.status === 'OK') {
                setMovimientos(resp.sheduled)
                const sche = { ...programacion, movs: resp.sheduled, updated: true}
                setProgramacion(sche)
                if(notifSchedule) notifSchedule(sche)
                notification.success({
                    message: 'Programación',
                    description: 'Datos cargados exitosamente'
                })
                if(mode === 'edit') {
                    notification.warning({
                        message: 'Guardar Datos',
                        description: 'Los datos solo se graban al presionar el botón "Guardar"',
                        duration: 10
                    })
                }
            }else {
                notification.error({
                    message: 'Error',
                    description: resp.message
                })
            }
            return false
          },
          multiple: false,
          fileList
        }
    }

    const renderFieldTask = (task) => {
        return (
            <Form.Item label={t('messages.mills.task.' + task)}>
                { getFieldDecorator(task, {
                    initialValue: (scheduled?.tasks && scheduled?.tasks[task])? ('' + scheduled.tasks[task]) : '',
                    rules: [{
                        required: !readOnly,
                        message: 'Campo requerido'
                    }]
                })(
                    <NumericInput readOnly={readOnly} />
                )}
            </Form.Item>
        )
    }

    const downloadScheduled = () => {
        ReportService.read('/downloadScheduled', { id: molino.id}, null, 'Programado.xlsx')
    }

    return (
        <div className='step5'>
            <Collapse defaultActiveKey={["1", "2"]}>
                <Panel header="Movimientos por Turno" key="1">
                    { mode === "new" &&
                        <Row>
                            A continuación ingrese los datos de Movimientos programados
                        </Row>
                    }
                    <Row gutter={[16, 16]} style={{padding: 10}}>
                        <Col span={4} offset={mode === 'view' ? 16 : 8} style={{textAlign:'center'}}>
                            { mode === 'new' ?
                                <Button size="small" icon="file-excel" href={apiConfig.url + '/../load/Programacion.xlsx'}>Descargar Plantilla</Button>
                            :
                                <Button size="small" icon="file-excel" onClick={downloadScheduled}>Descargar</Button>
                            }
                        </Col>
                        { (mode === "new" || mode === "edit") &&
                            <Col span={4} style={{textAlign:'center'}}>
                                <Upload {...getPropsUpload()}>
                                    <Button size="small" icon="upload">
                                        Cargar archivo
                                    </Button>
                                </Upload>
                            </Col>
                        }
                    </Row>
                    <Row>
                        <Table columns={ getTableColumns() } dataSource={ movimientos } size="small" pagination={movimientos && movimientos.length > 10}/>
                    </Row>
                </Panel>
                <Panel header="Movimientos por Tareas" key="2">
                    <Form {...formItemLayout}>
                        { renderFieldTask('DET_PLANTA') }
                        { renderFieldTask('BLOQUEO_PRUEBA_ENERGIA_0') }
                        { renderFieldTask('RETIRO_CHUTE') }
                        { renderFieldTask('ING_LAINERA') }
                        { renderFieldTask('GIRO') }
                        { renderFieldTask('RET_LAINERA') }
                        { renderFieldTask('INST_CHUTE') }
                        { renderFieldTask('DESBLOQUEO') }
                    </Form>
                </Panel>
            </Collapse>
            
            { mode === "new" &&
                <Row className="tools">
                    <a onClick={prevStepLocal} className="prev-step"><Icon type="left" /></a>
                    <Button type="primary" onClick={saveFaenaLocal} className="save" icon="save">Grabar nueva Faena</Button>
                </Row>
            }
        </div>
    )
}

export default Form.create()(Step5);
