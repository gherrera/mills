import "./TabForms.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Button,
  Spin,
  Input,
  Checkbox,
  Modal,
  Form,
  Select,
  Tooltip,
  notification,
  Pagination
} from "antd";
import { FormDetail } from '../'
import { camelizerHelper } from "../../../../helpers";

import { useTranslation } from "react-i18next";
import moment from "moment";
import { getFormByClienteIdPromise, updateFormPromise, getFormHashPromise } from "./promises";

const TabForms = ({ form, breadcrumbs, refreshBreadCrumbs }) => {
	const { t } = useTranslation()
  const { getFieldDecorator, validateFields } = form;
  const [forms, setForms] = useState([])
  const [frm, setFrm] = useState(null)
  const [key, setKey] = useState(Math.random())
  const [ isLoading, setIsLoading ] = useState(true)
  const [ isVisibleNewForm, setIsVisibleNewForm ] = useState(false)
  const [ isVisibleURL, setIsVisibleURL ] = useState(false)
  const [ hashURL, setHashURL ] = useState(null)
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ totalRecords, setTotalRecords ] = useState(-1)
  const recordsxPage = 10

  useEffect(() => {
    loadForms(1)
  }, [])

  const loadForms = (page) => {
    setIsLoading(true)
    let from = (page-1) * recordsxPage
    getFormByClienteIdPromise(from, recordsxPage).then(response => {
      let records = response.records
      setForms(records)
      setTotalRecords(response.total)
      setIsLoading(false)
    })
  }

  const handleClickForm = () => {
    setKey(Math.random())
    let b = []
    b.push(breadcrumbs[0])
    if(breadcrumbs.length === 2) {
      b.push(breadcrumbs[1])
      b[1].link = null
    }
    refreshBreadCrumbs({ breadcrumbs: b, title: form.name })
  }

  const handleEditForm = async (f) => {
    setFrm(f)
    let b = []
    b.push(breadcrumbs[0])
    refreshBreadCrumbs({ breadcrumbs: b, title: f.name } )
    //refreshBreadCrumbs({ title: f.name } )
  }

  const _refreshBreadCrumbs = (title, nav) => {
    let b = []
    b.push(breadcrumbs[0])
    if(breadcrumbs.length === 2) {
      b.push(breadcrumbs[1])
    }else {
      b.push({title: frm.name})
    }
    b[1].onClick = handleClickForm
    b[1].link = 'design'      
  if(nav) b.push({ title: nav })
    refreshBreadCrumbs({ breadcrumbs: b, title } )
  }

  const handleChangeAttrForm = (index, key, value) => {
    let fs = forms.map((f, i) => {
      if (index == i) {
        return { ...f, [key]: value };
      } else {
        return f;
      }
    })
    let f = fs[index]
    updateFormPromise(f)
    setForms(fs)
  }

  const changeNameForm = (index, value) => {
    handleChangeAttrForm(index, 'name', value)
  }

  const changeActiveForm = (index, checked) => {
    handleChangeAttrForm(index, 'status', checked ? 'ACTIVE' : 'INACTIVE')
  }

  const handleOpenNewForm = () => {
    setIsVisibleNewForm(true)
  }

  const closeModalHandler = (create) => {
    if(create) {
      validateFields(['category','name']).then((obj) => {
        updateFormPromise({ ...obj, status: 'ACTIVE' }).then(r => {
          loadForms(currentPage)
        })
        setIsVisibleNewForm(false)
      })
    }else {
      setIsVisibleNewForm(false)
    }
  }

  const handleDeleteForm = (f) => {
    Modal.confirm({
      title: 'Está seguro de eliminar el formulario?',
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        updateFormPromise({ ...f, deleted: true }).then(r => {
          loadForms(currentPage)
          notification.success({
            message: 'Formulario borrado'
          })
        })
      },
      onCancel() {
        console.log('Cancel');
      },
    })
  }

  const handleVisibleForm = async (visible, formId) => {
    setHashURL(null)
    if(visible) {
      let hash = await getFormHashPromise(formId)
      setHashURL(hash)
    }
    setIsVisibleURL(visible)
  }

  const handleChangePage = (page) => {
    setCurrentPage(page)
    loadForms(page)
  }

  return (
    <div className="tab-forms-design">
      { frm !== null ? <FormDetail key={key} formId={frm.id} refreshBreadCrumbs={_refreshBreadCrumbs} />
      :
      <>
        <Row className="tools-form">
          <Button icon="plus" type="primary" onClick={handleOpenNewForm}>Nuevo Formulario</Button>
        </Row>
        <Row className="titles-section">
          <Col span={1}>Nro</Col>
          <Col span={2}>Categoria</Col>
          <Col span={7}>Nombre</Col>
          <Col span={3}>Creado por</Col>
          <Col span={3}>Fecha de Creación</Col>
          <Col span={3}>Ultima modificacion</Col>
          <Col span={2}>Activo</Col>
          <Col span={3}>Edición</Col>
        </Row>
        <div className="body">
          { isLoading ? <Spin size="large" />
          :
          <>
            { forms.map((f, index) =>
              <Row className="rows-section">
                <Col span={1}>{f.nro}</Col>
                <Col span={2}>{camelizerHelper(f.category)}</Col>
                <Col span={7}><Input size="small" value={f.name} onChange={(e) => changeNameForm(index, e.target.value)} className="editable"/></Col>
                <Col span={3}>{f.userCreate}</Col>
                <Col span={3}>{moment(f.creationDate).format('DD/MM/YYYY HH:mm')}</Col>
                <Col span={3}>{f.updateDate && moment(f.updateDate).format('DD/MM/YYYY HH:mm')}</Col>
                <Col span={2}>
                  <Checkbox checked={f.status === 'ACTIVE'} onChange={(e) => changeActiveForm(index, e.target.checked)}/>
                </Col>
                <Col span={3} className="tools-rows-forms">
                  <Tooltip title="Modificar">
                    <Button icon="edit" size="small" onClick={(e) => handleEditForm(f)}/>
                  </Tooltip>
                  <Tooltip title="Historial">
                    <Button icon="folder-open" size="small" />
                  </Tooltip>
                  <Tooltip title="Eliminar">
                     <Button icon="delete" size="small" onClick={(e) => handleDeleteForm(f)}/>
                  </Tooltip>
                  <Tooltip title="URL">
                    <Button icon="link" size="small" onClick={() => handleVisibleForm(true, f.id)} />
                  </Tooltip>
                </Col>
              </Row>
            )}
            { isVisibleNewForm &&
              <Modal
                visible={true}
                title="Nuevo Formulario"
                onOk={ () => closeModalHandler(true)  }
                onCancel={ () => closeModalHandler(false) }
              >
                <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Form.Item label="Categoría">
                  { getFieldDecorator('category', {
                        validateTrigger: "onChange",
                        rules:
                          [
                            { required: true, message: 'Campo requerido' }
                          ]
                      })(
                      <Select>
                        <Select.Option value="CLIENTE">Cliente</Select.Option>
                        <Select.Option value="COLABORADOR">Colaborador</Select.Option>
                        <Select.Option value="PROVEEDOR">Proveedor</Select.Option>
                        <Select.Option value="DIRECTOR">Director</Select.Option>
                      </Select>
                      )
                  }
                  </Form.Item>
                  <Form.Item label="Formulario">
                  { getFieldDecorator('name', {
                        validateTrigger: "onChange",
                        rules:
                          [
                            { required: true, message: 'Campo requerido' }
                          ]
                      })(
                      <Input/>
                      )
                  }
                  </Form.Item>
                </Form>
              </Modal>
            }

            { isVisibleURL &&
              <Modal
                visible={true}
                title="Link Formulario"
                onCancel={ () => handleVisibleForm(false) }
                width={700}
                footer={ [
                  <Button onClick={ () => handleVisibleForm(false) }>
                    { t('messages.aml.btnClose') }
                  </Button>
                ]
                }
              >
                <Input readOnly={true} value={window.location.protocol+'//'+window.location.host+ '/form/' + hashURL} size="small"/>
              </Modal>
            }
          </>
          }
        </div>
        { totalRecords > forms.length &&
          <Pagination current={currentPage} total={totalRecords} pageSize={recordsxPage} onChange={handleChangePage} size="small"/>
        }
      </>
      }
    </div>
  )
}
export default Form.create()(TabForms);
