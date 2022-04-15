import './AdminUsers.scss'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { UsersService } from '../../services'
import { getUsersPromise, getClientsPromise } from '../../promises'
import { Button, Icon, Modal, notification, Table, Tooltip, Spin } from 'antd'
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
    modal: '',
    clients: []
	}

  getBreadcrumbs() {
    const breadcrumbs = [
      { title: 'Gestión de cuentas', icon: 'form', link: '/accounts', onClick: this.clickMenuDesign.bind(this) }
    ]

    return breadcrumbs
  }

  clickMenuDesign() {
    this.setState({ keyTab: Math.random(), breadcrumbs: this.getBreadcrumbs(), title: '' })
  }

  async loadUsers() {
    const data = await getUsersPromise()
    const clients = await getClientsPromise()
    await this.setState({
      data,
      clients,
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
              message: t('messages.mills.notifications.succesfulOperation'),
              description: 'La cuenta de usuario ha sido correctamente eliminada.'
            })
          }else {
            notification.error({
              message: t('messages.mills.notifications.anErrorOcurred'),
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
            const data = await getUsersPromise()
            this.setState({ data, isModalVisible: false })

            notification['success']({
              message: t('messages.mills.notifications.succesfulOperation'),
              description: 'Usuario creado exitosamente'
            })
          }else {
            notification.error({
              message: t('messages.mills.notifications.anErrorOcurred'),
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
            const data = await getUsersPromise()
            this.setState({ data, isModalVisible: false })

            notification['success']({
              message: t('messages.mills.notifications.succesfulOperation'),
              description: 'Usuario guardado'
            })
          }else {
            notification.error({
              message: t('messages.mills.notifications.anErrorOcurred'),
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
        title: [ <Icon type="user-add" />, ' ', 'Nuevo usuario' ],
        className: 'modal-user-create',
        content: <ModalCreateContent key={ Math.floor((Math.random() * 100) + 1) } clients={this.state.clients} currentUser={ user } password={ generatePasswordHelper() } onOk={ this.handleModalOk.bind(this) } onCancel={ this.handleModalCancel.bind(this) } modalType="create" />
      }
    }

    if (type === 'view') {
      content = {
        title: [ <Icon type="eye" />, ' ', 'Información' ],
        className: 'modal-user-create',
        content: <ModalCreateContent key={ Math.floor((Math.random() * 100) + 1) } clients={this.state.clients} currentUser={ currentUser } user={ user } onOk={ this.handleModalOk.bind(this) } onCancel={ this.handleModalCancel.bind(this) } modalType="view" />
      }
    }

    if (type === 'edit') {
      content = {
        title: [ <Icon type="edit" />, ' ', 'Editar usuario' ],
        className: 'modal-user-create',
        content: <ModalCreateContent key={ Math.floor((Math.random() * 100) + 1) } clients={this.state.clients} user={ user }  password={ generatePasswordHelper() } currentUser={ currentUser } onOk={ this.handleModalOk.bind(this) } onCancel={ this.handleModalCancel.bind(this) } modalType="edit" />
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
            return 'Administrador'
          case 'CONTROLLER':
            return 'Controlador'
          case 'DASHBOARD':
            return 'Dashboard'
            default:
            return text
        }
      })
      },
      { title: 'Nombre', dataIndex: 'name' },
      { title: 'Usuario', dataIndex: 'login' },
      { title: 'Correo', dataIndex: 'email' },
      { 
        title: t('messages.mills.creationDate'), 
        dataIndex: 'creationDate', 
        render: (text => 
          moment(text).format('DD/MM/YYYY HH:mm')
        ) 
      },
      { 
        title: 'Cliente', 
        dataIndex: 'client',
        render: (client, record) => record.type === 'DASHBOARD' && client && client.name
      },
      { title: "Estado", dataIndex: 'status', render: (text => {
          return t('messages.mills.status.' + text)
      }) },
      { title: '', dataIndex: 'id', render: (id, user) => (
        <div className="actions">
          { !(currentUser.type === 'ADMIN' || (currentUser.id === id )) ?
            <Icon className="disabled" type="edit" theme="filled" />
            :
            <Icon type="edit" theme="filled" onClick={ this.renderModal.bind(this, 'edit', user) } />
          }&nbsp;&nbsp;
          {
            (currentUser.id === id) ?
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
                <Button id="create-user" type="primary" icon="user" onClick={ this.renderModal.bind(this, 'create', currentUser) }>Nuevo Usuario</Button>
              }
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
