import "./TabForms.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Button,
  Spin,
  Modal,
  Tooltip,
  Pagination,
  Icon,
  notification
} from "antd";
import { camelizerHelper } from "../../../../helpers";

import { useTranslation } from "react-i18next";
import moment from "moment";
import { getFormByClienteIdPromise } from "../../promises";
import { FormDetail, ModalPdfViewer } from "..";
import { Filter } from "./components";
import { updateFormPromise } from "../../promises";

const TabForms = ({status}) => {
	const { t } = useTranslation()
  const [forms, setForms] = useState([])
  const [frm, setFrm] = useState(null)
  const [ isLoading, setIsLoading ] = useState(true)
  const [ pdfItem, setPdfItem ] = useState(null)
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ totalRecords, setTotalRecords ] = useState(-1)
  const [ showFilter, setShowFilter ] = useState(false)
  const [ filters, setFilters ] = useState({})
  const recordsxPage = 10

  useEffect(() => {
    loadForms(1, {})
  }, [])

  const loadForms = (page, filters) => {
    setIsLoading(true)
    let from = (page-1) * recordsxPage
    filters.status = status
    getFormByClienteIdPromise(from, recordsxPage, filters).then(response => {
      setForms(response.records)
      setTotalRecords(response.total)
      setIsLoading(false)
    })
  }

  const cbFilters = (objFilters) => {
		setFilters(objFilters);
		loadForms(1, objFilters);
	};

  const handleViewForm = (f) => {
    setFrm(f)
  }

  const handleViewPDF = (f) => {
    setPdfItem(f)
  }

  const closeHandler = () => {
    setFrm(null)
  }

  const closeHandlerPDF = () => {
    setPdfItem(null)
  }

  const handleChangePage = (page) => {
    setCurrentPage(page)
    loadForms(page, filters)
  }

  const getStatus = (status) => {
    if(status === 'RECIBIDO') return 'Recibidos'
    else if(status === 'PENDIENTE') return 'Pendientes'
    else if(status === 'EVALUACION') return 'En Evaluación'
    else if(status === 'CERRADO') return 'Cerrados'
  }

  const handleShowFilter = (visible) => {
    setShowFilter(visible)
  }

  const handleDeleteForm = (f) => {
    Modal.confirm({
      title: 'Está seguro de eliminar el formulario?',
      content: <>Usted eliminará el {f.folio}, si efectúa esta operación la información contenida dejará de existir.</>,
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        updateFormPromise({ ...f, deleted: true }).then(r => {
          loadForms(currentPage, filters)
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

  return (
    <div className="tab-forms">
      <Row className="row-header">
        { status && 
            <h2 className="title">{getStatus(status)}</h2>
        }
        <Col className="filter">
          <Button type="link" icon="filter" onClick={() => handleShowFilter(!showFilter)}>Búsqueda avanzada</Button>
          <Icon type={showFilter ? 'close' : 'down'}/>
        </Col>
      </Row>
      { showFilter && <Filter cbFilters={cbFilters} /> }
      <Row className="titles-section" gutter={4}>
        <Col span={1}>Folio</Col>
        <Col span={2}>Categoria</Col>
        <Col span={7}>Nombre</Col>
        <Col span={3}>Doc. de Identidad</Col>
        <Col span={3}>Destinatario</Col>
        <Col span={4}>Email</Col>
        <Col span={2}>Fecha Recibido</Col>
        <Col span={2}></Col>
      </Row>
      <div className="body">
        { isLoading ? <Spin size="large"/>
        : totalRecords === 0 ? <h3 className="no-results">No hay resultados</h3>
        :
          <>
            { forms.map((f, index) =>
              <Row className="rows-section" gutter={4}>
                <Col span={1}>{f.folio}</Col>
                <Col span={2}>{camelizerHelper(f.category)}</Col>
                <Col span={7}>{f.name}</Col>
                <Col span={3}>{f.dest ? f.dest.rut : '[Destinatario eliminado]'}</Col>
                <Col span={3}>{f.dest ? f.dest.name : '[Destinatario eliminado]'}</Col>
                <Col span={4}>{f.dest ? f.dest.email : '[Destinatario eliminado]'}</Col>
                <Col span={2}>{f.sendDate && moment(f.sendDate).format('DD/MM/YYYY HH:mm')}</Col>
                <Col span={2} className="tools-rows-forms">
                  <Tooltip title="Detalles">
                    <Button icon="info" size="small" onClick={(e) => handleViewForm(f)}/>
                  </Tooltip>
                  <Tooltip title="PDF">
                    <Button icon="file-pdf" size="small" onClick={(e) => handleViewPDF(f)}/>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                     <Button icon="delete" size="small" onClick={(e) => handleDeleteForm(f)}/>
                  </Tooltip>
                </Col>
              </Row>
            )}
            { frm !== null && <FormDetail form={frm} closeHandler={closeHandler} /> }
            { pdfItem &&
              <Modal
                className="modal-pdf-viewer"
                visible={true}
                title="Declaración"
                width = {1200}
                style={{ top: 10 }}
                header={ null }
                footer= { [<Button key="back" onClick={ closeHandlerPDF }>Cerrar</Button>] }
                onCancel={ closeHandlerPDF }
              >
                <ModalPdfViewer pdfId={pdfItem.id} />
              </Modal>          
            }
          </>
        }
      </div>
      { totalRecords > forms.length &&
        <Pagination current={currentPage} total={totalRecords} pageSize={recordsxPage} onChange={handleChangePage} size="small"/>
      }
    </div>
  )
}
export default TabForms;
