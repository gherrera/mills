import './AdminAudit.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import moment from 'moment'
import { Pagination, Spin, Table } from 'antd'
import { getAuditPromise } from './promises'
import { AdminAuditFilters } from './components'
import { ReportService } from '../../services'

class AdminAudit extends Component {
  initialFiltersState = {
    filtersDate: 'ALL',
    filtersDateFrom: '',
    filtersDateTo: '',
    filtersUser: '',
    filtersAction: ''
  }

  state = {
    isLoading: true,
    isLoadingReport: false,
    filtersDate: this.initialFiltersState.filtersDate,
    filtersDateFrom: this.initialFiltersState.filtersDateFrom,
    filtersDateTo: this.initialFiltersState.filtersDateTo,
    filtersUser: this.initialFiltersState.filtersUser,
    filtersAction: this.initialFiltersState.filtersAction,
    results: [],
    currentPage: 1,
    fromNum: 0,
    resultsPerPage: 10,
    resultsTotalNum: -1
  }

  async componentDidMount() {
    this.getFirstSearchResults()
  }

  getFilters() {
    const filters = {}

    for (let key in this.initialFiltersState) {
      let value = this.state[key]
      if (key === 'filtersDate') {
        filters['optDates'] = value
        if (value === 'RANGE') {
          filters['fromDate'] = this.state['filtersDateFrom']
          filters['toDate'] = this.state['filtersDateTo']
        }
      }

      if (key === 'filtersUser') {
        filters['userId'] = value
      }

      if (key === 'filtersAction') {
        filters['type'] = value
      }
    }
    return filters
  }

  async getFirstSearchResults() {
    this.handlePaginationOnChange(1)
  }

  async handlePaginationOnChange(currentPage) {
    const { resultsPerPage } = this.state
    const fromNum = ((currentPage - 1) * resultsPerPage)

    await this.setState({ isLoading: true, fromNum: fromNum })

    const searchResults = await getAuditPromise(fromNum, resultsPerPage, this.getFilters())

    await this.setState({
      isLoading: false,
      results: searchResults.records,
      currentPage: currentPage,
      resultsTotalNum: searchResults.total
    })
  }

  renderTableColumns() {
    const { t } = this.props

    const tableColumns = [
      {
        title: t('messages.aml.date'),
        dataIndex: 'dateShortAsString',
        className: 'nowrap'
      },
      {
        title: t('messages.aml.username'),
        dataIndex: 'userName',
        className: 'nowrap'
      },
      {
        title: t('messages.aml.type'),
        dataIndex: 'type',
        render: (text) => t('messages.aml.action.' + text)
      },
      {
        title: t('messages.aml.detail'),
        dataIndex: 'subType'
      },
      {
        title: t('messages.aml.parameters'),
        dataIndex: 'params',
        className: 'params-cell',
        render: text => <div>{ text }</div>
      }
    ]

    return tableColumns
  }

  async onExportHandler() {
    await this.setState({ isLoadingReport: true })
    await ReportService.read('/excelMovimientos', this.getFilters(), null, 'movimientos.xlsx')
    await this.setState({ isLoadingReport: false })
  }

  handleOnChangeDate(filtersDate) {
    this.setState({ filtersDate })
  }

  handleOnChangeDateFrom(filtersDateFrom) {
    this.setState({ filtersDateFrom: moment(filtersDateFrom).format('DD/MM/YYYY') })
  }

  handleOnChangeDateTo(filtersDateTo) {
    this.setState({ filtersDateTo: moment(filtersDateTo).format('DD/MM/YYYY') })
  }

  handleOnChangeUser(filtersUser) {
    this.setState({ filtersUser })
  }

  handleOnChangeAction(filtersAction) {
    this.setState({ filtersAction })
  }

  handleOnClickRestoreFilters() {
    this.setState({
      filtersDate: this.initialFiltersState.filtersDate,
      filtersDateFrom: this.initialFiltersState.filtersDateFrom,
      filtersDateTo: this.initialFiltersState.filtersDateTo,
      filtersUser: this.initialFiltersState.filtersUser,
      filtersAction: this.initialFiltersState.filtersAction,
      currentPage: 1,
      fromNum: 0,
      resultsPerPage: 10,
      resultsTotalNum: -1
    })
    this.getFirstSearchResults()
  }

  render() {
    const { isLoading, isLoadingReport, filtersDate, filtersDateFrom, filtersDateTo, filtersUser, filtersAction, results, currentPage, resultsTotalNum, resultsPerPage } = this.state

    return (
      <div className="admin-audit">
        <AdminAuditFilters
          defaultValues={{ filtersDate, filtersDateFrom, filtersDateTo, filtersUser, filtersAction }}
          onChangeDateHandler={ this.handleOnChangeDate.bind(this) }
          onChangeDateFromHandler={ this.handleOnChangeDateFrom.bind(this) }
          onChangeDateToHandler={ this.handleOnChangeDateTo.bind(this) }
          onChangeUserHandler={ this.handleOnChangeUser.bind(this) }
          onChangeActionHandler={ this.handleOnChangeAction.bind(this) }
          onClickRestoreFiltersHandler={ this.handleOnClickRestoreFilters.bind(this) }
          onClickExportHandler={ this.onExportHandler.bind(this) }
          onSubmit={ this.getFirstSearchResults.bind(this) }
          />
          <div className="table-wrapper">
            { isLoading ?
              <Spin spinning={ true } size="large" />
              :
              <Table dataSource={ results } columns={ this.renderTableColumns() } pagination={ false } loading={ isLoadingReport } size="small" />
            }
          </div>
          <Pagination current={ currentPage } total={ resultsTotalNum } onChange={ this.handlePaginationOnChange.bind(this) } pageSize={ resultsPerPage } size="small" />
      </div>
    )
  }
}

export default withTranslation()(AdminAudit)
