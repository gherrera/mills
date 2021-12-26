import "./TabRecipients.scss";
import React, { useEffect, useState } from "react";
import {
  Col,
  Row,
  Button,
  Spin,
  Tooltip,
  Pagination,
  Icon,
  notification,
  Modal
} from "antd";
import { camelizerHelper } from "../../../../helpers";

import { useTranslation } from "react-i18next";
import moment from "moment";
import { deleteRecipientPromise, getRecipientsByClienteIdPromise, updateRecipientPromise } from "../../promises";
import { RecipientDetail } from "..";
import { Filter } from "./components";

const TabRecipients = ({}) => {
	const { t } = useTranslation()
  const [recipients, setRecipients] = useState([])
  const [ recipient, setRecipient] = useState(null)
  const [ isLoading, setIsLoading ] = useState(true)
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ totalRecords, setTotalRecords ] = useState(-1)
  const [ showFilter, setShowFilter ] = useState(false)
  const [ filters, setFilters ] = useState({})
  const recordsxPage = 10

  useEffect(() => {
    loadRecipients(1, {})
  }, [])

  const loadRecipients = (page, filters) => {
    setIsLoading(true)
    let from = (page-1) * recordsxPage
    getRecipientsByClienteIdPromise(from, recordsxPage, filters).then(response => {
      setRecipients(response.records)
      setTotalRecords(response.total)
      setIsLoading(false)
    })
  }

  const cbFilters = (objFilters) => {
		setFilters(objFilters);
		loadRecipients(1, objFilters);
	};

  const handleViewRecipient = (r) => {
    setRecipient(r)
  }

  const closeHandler = () => {
    setRecipient(null)
  }

  const handleChangePage = (page) => {
    setCurrentPage(page)
    loadRecipients(page, filters)
  }

  const handleShowFilter = (visible) => {
    setShowFilter(visible)
  }

  const handleDeleteRecipient = (r) => {
    Modal.confirm({
      title: 'Está seguro de eliminar el Destinatario?',
      content: <>Usted eliminará el destinatario {r.rut}, si efectúa esta operación la información contenida dejará de existir.</>,
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteRecipientPromise(r.id).then(response => {
          loadRecipients(currentPage, filters)
          notification.success({
            message: 'Destinatario borrado'
          })
        })
      },
      onCancel() {
        console.log('Cancel');
      },
    })
  }

  return (
    <div className="tab-recipients">
      <Row className="row-header">
        <Col className="filter">
          <Button type="link" icon="filter" onClick={() => handleShowFilter(!showFilter)}>Búsqueda avanzada</Button>
          <Icon type={showFilter ? 'close' : 'down'}/>
        </Col>
      </Row>
      { showFilter && <Filter cbFilters={cbFilters} /> }
      <Row className="titles-section" gutter={4}>
        <Col span={6}>Nombre</Col>
        <Col span={3}>Tipo Doc</Col>
        <Col span={3}>Doc. de Identidad</Col>
        <Col span={3}>Tipo Persona</Col>
        <Col span={4}>Email</Col>
        <Col span={2}>Fecha Creación</Col>
        <Col span={2}></Col>
      </Row>
      <div className="body">
        { isLoading ? <Spin size="large"/>
        : totalRecords === 0 ? <h3 className="no-results">No hay resultados</h3>
        :
          <>
            { recipients.map((rec, index) =>
              <Row className="rows-section" gutter={4}>
                <Col span={6}>{rec.name}</Col>
                <Col span={3}>{rec.tipDoc}</Col>
                <Col span={3}>{rec.rut}</Col>
                <Col span={3}>{rec.type}</Col>
                <Col span={4}>{rec.email}</Col>
                <Col span={2}>{moment(rec.creationDate).format('DD/MM/YYYY HH:mm')}</Col>
                <Col span={2} className="tools-rows-forms">
                  <Tooltip title="Detalles">
                    <Button icon="edit" size="small" onClick={(e) => handleViewRecipient(rec)}/>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                     <Button icon="delete" size="small" onClick={(e) => handleDeleteRecipient(rec)}/>
                  </Tooltip>
                </Col>
              </Row>
            )}
            { recipient !== null && <RecipientDetail recipient={recipient} closeHandler={closeHandler} /> }
          </>
        }
      </div>
      { totalRecords > recipients.length &&
        <Pagination current={currentPage} total={totalRecords} pageSize={recordsxPage} onChange={handleChangePage} size="small"/>
      }
    </div>
  )
}
export default TabRecipients;
