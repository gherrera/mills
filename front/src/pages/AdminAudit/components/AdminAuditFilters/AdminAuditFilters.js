import './AdminAuditFilters.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Col, DatePicker, Row, Select } from 'antd'
import { UsersService } from '../../../../services'

const { Option } = Select

export default ({
  defaultValues,
  onChangeDateHandler,
  onChangeDateFromHandler,
  onChangeDateToHandler,
  onChangeUserHandler,
  onChangeActionHandler,
  onClickRestoreFiltersHandler,
  onClickExportHandler,
  onSubmit
}) => {
  const [users, setUsers] = useState([])
  const [datePickerIsDisabled, setDatePickerIsDisabled] = useState(true)

  useEffect(() => {
    UsersService.read()
      .then(response => setUsers(response.data.records))
      .catch(err => console.log(err))
  }, [])

  const handleDateChange = (value) => {
    if (value === 'RANGE') {
      setDatePickerIsDisabled(false)
    } else {
      setDatePickerIsDisabled(true)
    }

    onChangeDateHandler(value)
  }

  const { t } = useTranslation()

  return (
    <div className='admin-search-filters'>
      <Row>
        <Col xs={6}>
          <div className="user module">
            { t('messages.aml.action') } :
            <div className="module-inner">
              <Select defaultValue={ defaultValues.filtersAction } value={ defaultValues.filtersAction } onChange={ onChangeActionHandler } style={{ width: '100%' }}>
                <Option value="">[ { t('messages.aml.all') } ]</Option>
                <Option value="SESSION_START">{ t('messages.aml.action.SESSION_START') }</Option>
                <Option value="SESSION_END">{ t('messages.aml.action.SESSION_END') }</Option>
                <Option value="SESSION_ERROR">{ t('messages.aml.action.SESSION_ERROR') }</Option>
                <Option value="UPLOAD">{ t('messages.aml.action.UPLOAD') }</Option>
                <Option value="ADD">{ t('messages.aml.action.ADD') }</Option>
                <Option value="UPDATE">{ t('messages.aml.action.UPDATE') }</Option>
                <Option value="LOAD">{ t('messages.aml.action.LOAD') }</Option>
              </Select>
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <div className="user module">
            { t('messages.aml.username') } :
            <div className="module-inner">
              <Select defaultValue={ defaultValues.filtersUser } value={ defaultValues.filtersUser } onChange={ onChangeUserHandler } style={{ width: '100%' }}>
                <Option value="">[ { t('messages.aml.allTheUsers') } ]</Option>
                { users.map(user => <Option value={ user.id }>{ user.name }</Option>) }
              </Select>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <div className="dates module">
            { t('messages.aml.dates') } :
            <div className="module-inner">
              <Select defaultValue={ defaultValues.filtersDate } value={ defaultValues.filtersDate } onChange={ handleDateChange } style={{ width: '100%' }}>
                <Option value="ALL">[ { t('messages.aml.allDates') } ]</Option>
                <Option value="TODAY">{ t('messages.aml.today') }</Option>
                <Option value="WEEK">{ t('messages.aml.lastWeek') }</Option>
                <Option value="MONTH">{ t('messages.aml.lastMonth') }</Option>
                <Option value="3MONTH">{ t('messages.aml.last3Months') }</Option>
                <Option value="RANGE">{ t('messages.aml.customRange')}</Option>
              </Select>
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <div className="date-pickers module">
            <Row>
              <Col xs={ 12 }>
                { t('messages.aml.fromDate') } :
                <div className="module-inner">
                  <DatePicker format="DD/MM/YYYY" defaultValue={ defaultValues.filtersDateFrom } disabled={ datePickerIsDisabled } onChange={ onChangeDateFromHandler } placeholder="Fecha desde" style={{ opacity: datePickerIsDisabled ? 0.5 : 1 }} />
                </div>
              </Col>
              <Col xs={ 12 }>
                { t('messages.aml.toDate') } :
                <div className="module-inner">
                  <DatePicker format="DD/MM/YYYY" defaultValue={ defaultValues.filtersDateTo } disabled={ datePickerIsDisabled } onChange={ onChangeDateToHandler } placeholder="Fecha hasta" style={{ opacity: datePickerIsDisabled ? 0.5 : 1 }} />
                </div>
              </Col>
            </Row>
          </div>
        </Col>
        <Col xs={12}>
          <div className="submit module">
            <div className="module-inner">
              <Button type="primary" onClick={ onSubmit } icon="check">{ t('messages.aml.apply') }</Button>&nbsp;
              <Button type="primary" onClick={ onClickExportHandler } icon="file-excel">{ t('messages.aml.export') }</Button>&nbsp;
              <Button onClick={ onClickRestoreFiltersHandler } icon="stop" ghost>{ t('messages.aml.restore') }</Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
