import './AdminUsers.scss'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { UsersService } from '../../services'
import { getUsersByClientPromise } from '../../promises'
import { Button, Icon, Modal, notification, Popconfirm, Table, Tooltip, Spin } from 'antd'
import { Page, PageContent,  PageHeader } from '../../layouts/Private/components'
import ModalCreateContent from './ModalContentCreate'
import { generatePasswordHelper } from '../../helpers'
import { ReportService } from '../../services'
import moment from "moment";

class AdminUsers extends React.Component {
  state = {
    breadcrumbs: this.getBreadcrumbs(),
    title: '',
    keyTab: Math.random(),
    data: {},
    isLoading: true,
    isLoadingReport: false,
    isModalVisible: false,
    modal: ''
	}

  getBreadcrumbs() {
    const breadcrumbs = [
      { title: 'Gesitón de cuentas', icon: 'form', link: '/accounts', onClick: this.clickMenuDesign.bind(this) }
    ]

    return breadcrumbs
  }

  clickMenuDesign() {
    this.setState({ keyTab: Math.random(), breadcrumbs: this.getBreadcrumbs(), title: '' })
  }

  async loadUsers() {
    const data = await getUsersByClientPromise()

    await this.setState({
      data,
      isLoading: false
    })
  }

  async componentDidMount() {
    this.loadUsers()
  }

  async handleUserDelete(userId) {
    const { t } = this.props

    Modal.confirm({
      title: 'Está seguro de eliminar el usuario?',
      okText: 'Sí',
      cancelText: 'No',
      onOk: () => {
        UsersService.delete(userId)
        .then(async response => {
          if (response.data === "OK") {
            this.loadUsers()

            notification.success({
              message: t('messages.aml.notifications.succesfulOperation'),
              description: 'La cuenta de usuario ha sido correctamente eliminada.'
            })
          }else {
            notification.error({
              message: t('messages.aml.notifications.anErrorOcurred'),
              description: 'Error al eliminar Usuario'
            })
          }
        })
        .catch(err => console.log(err))
      },
      onCancel() {
        console.log('Cancel');
      },
    })
  }

  handleModalCancel = () => {
    this.setState({ isModalVisible: false })
  }

  async exportHandler() {
    await this.setState({ isLoadingReport: true })
    await ReportService.read('/excelUsuarios', null, null, 'usuarios.xlsx')
    await this.setState({ isLoadingReport: false })
  }

  async handleModalOk(modalType, user) {
    const { t } = this.props
    if (modalType === 'view') {
      this.setState({ isModalVisible: false })
    }

    if (modalType === 'create') {
      await UsersService.saveUser('I', user)
        .then(async response => {
          if(response.data === 'success') {
            const data = await getUsersByClientPromise()
            this.setState({ data, isModalVisible: false })

            notification['success']({
              message: t('messages.aml.notifications.succesfulOperation'),
              description: 'Usuario creado exitosamente'
            })
          }else {
            notification.error({
              message: t('messages.aml.notifications.anErrorOcurred'),
              description: response.data.message
            })
          }
        })
        .catch(err => console.log(err))
    }
    if (modalType === 'edit') {
      await UsersService.saveUser("U", user)
        .then(async response => {
          if(response.data === 'success') {
            const data = await getUsersByClientPromise()
            this.setState({ data, isModalVisible: false })

            notification['success']({
              message: t('messages.aml.notifications.succesfulOperation'),
              description: 'Usuario guardado'
            })
          }else {
            notification.error({
              message: t('messages.aml.notifications.anErrorOcurred'),
              description: response.data.message
            })
          }
        })
        .catch(err => console.log(err))
    }
  }

  renderModal(type, user) {
    const { currentUser, t } = this.props

    let content = {}

    if (type === 'create') {
      content = {
        title: [ <Icon type="user-add" />, ' ', t('messages.aml.createNewUser') ],
        className: 'modal-user-create',
        content: <ModalCreateContent key={ Math.floor((Math.random() * 100) + 1) } currentUser={ user } password={ generatePasswordHelper() } onOk={ this.handleModalOk.bind(this) } onCancel={ this.handleModalCancel.bind(this) } modalType="create" />
      }
    }

    if (type === 'view') {
      content = {
        title: [ <Icon type="eye" />, ' ', t('messages.aml.viewUserInfo') ],
        className: 'modal-user-create',
        content: <ModalCreateContent key={ Math.floor((Math.random() * 100) + 1) } currentUser={ currentUser } user={ user } onOk={ this.handleModalOk.bind(this) } onCancel={ this.handleModalCancel.bind(this) } modalType="view" />
      }
    }

    if (type === 'edit') {
      content = {
        title: [ <Icon type="edit" />, ' ', t('messages.aml.editUserInfo') ],
        className: 'modal-user-create',
        content: <ModalCreateContent key={ Math.floor((Math.random() * 100) + 1) } user={ user }  password={ generatePasswordHelper() } currentUser={ currentUser } onOk={ this.handleModalOk.bind(this) } onCancel={ this.handleModalCancel.bind(this) } modalType="edit" />
      }
    }

    this.setState({
      isModalVisible: true,
      modal: content
    })
  }

  render() {
    const { currentUser, t } = this.props
		const { breadcrumbs, title, keyTab } = this.state

    const tableColumns = [
      { title: 'Perfil', dataIndex: 'type', render: (text => {
        switch(text) {
          case 'ADMIN':
            return t('messages.aml.admin')
          case 'CONTROLLER':
            return 'Controlador'
          default:
            return text
        }
      })
      },
      { title: t('messages.aml.name'), dataIndex: 'name' },
      { title: t('messages.aml.username'), dataIndex: 'login' },
      { title: 'Correo', dataIndex: 'email' },
      { 
        title: t('messages.aml.creationDate'), 
        dataIndex: 'creationDate', 
        render: (text => 
          moment(text).format('DD/MM/YYYY HH:mm')
        ) 
      },
      { title: t('messages.aml.status'), dataIndex: 'status', render: (text => {
        switch(text) {
          case 'ACTIVE':
            return t('messages.aml.active')
          default:
            return t('messages.aml.inactive')
        }
      }) },
      { title: '', dataIndex: 'id', render: (id, user) => (
        <div className="actions">
          <Icon type="eye" theme="filled" onClick={ this.renderModal.bind(this, 'view', user) } /> &nbsp;&nbsp;
          { !(currentUser.type === 'ADMIN' || (currentUser.id === id )) ?
            <Icon className="disabled" type="edit" theme="filled" />
            :
            <Icon type="edit" theme="filled" onClick={ this.renderModal.bind(this, 'edit', user) } />
          }&nbsp;&nbsp;
          {
            currentUser.type === 'AUDIT' || currentUser.id === id || user.type === 'SADMIN' ?
              <Tooltip title="No tiene permisos eliminar este usuario." placement="left" trigger="click">
                <Icon className="disabled" type="delete" theme="filled" />
              </Tooltip>
            :
              <Icon type="delete" theme="filled"  onClick={ () => this.handleUserDelete(id) }/>
          }
        </div>
      )}
    ]

    return (
      <div className="admin-users">
        <Page>
          <PageHeader
            title={title}
            breadcrumbs={breadcrumbs}
            />
          <PageContent>
              <div className="tools-area">
              { currentUser.type !== 'AUDIT' &&
                <Button id="create-user" type="primary" icon="plus" onClick={ this.renderModal.bind(this, 'create', currentUser) }>{ t('messages.aml.createNewUser') }</Button>
              }
              &nbsp;
              <Button type="primary" icon="file-excel" onClick={ this.exportHandler.bind(this) }>Exportar</Button>
              </div>
              <div className="table-wrapper">
                {
                  this.state.isLoading ?
                    <Spin spinning={ true } size="large" />
                  :
                    <Table columns={ tableColumns } dataSource={ this.state.data } size="small" loading={ this.state.isLoadingReport } />
                }
              </div>
              <div id="modal-user">
                <Modal
                  title={ this.state.modal.title }
                  className={ this.state.modal.className }
                  visible={ this.state.isModalVisible }
                  style={{ top: 30 }}
                  footer={ null }
                  onCancel={ this.handleModalCancel }
                  >
                  { this.state.modal.content }
              </Modal>
              </div>
          </PageContent>
        </Page>
      </div>
    )
  }
}

export default withTranslation()(AdminUsers)
