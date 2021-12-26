import './CurrentUser.scss'
import React from 'react'
import { withRouter } from 'react-router'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button, Dropdown, Icon, Menu } from 'antd'
import { changePasswordPromise } from '../../../../promises'
import { ModalChangePassword } from '../'

class User extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isModalChangePasswordVisible: false
    }
  }

  handleOpenModalChangePassword() {
    this.setState({ isModalChangePasswordVisible: true })
  }

  handleCloseModalChangePassword() {
    this.setState({ isModalChangePasswordVisible: false })
  }

  async handleSaveModalChangePassword(passwordCurrent, passwordNew, passwordNewConfirm) {
    await changePasswordPromise(passwordCurrent, passwordNew, passwordNewConfirm)

    this.setState({ isModalChangePasswordVisible: false })
  }

  async handleLogout(e) {
    e.preventDefault()

    const { history, logoutHandler } = this.props

    await logoutHandler()

    history.push('/')
  }

  render() {
    const { t } = this.props
    const { currentUser } = this.props

    const dropdownMenu = (
      <Menu>
        {
          ( currentUser.type === 'ADMIN' ) &&
            <Menu.Item key="1">
              <Link to={ '/accounts' }>
                <Icon type="setting" /> &nbsp;Administración de cuentas
              </Link>
            </Menu.Item>
        }
        <Menu.Item key="2">
          <Link to={ '#' } onClick={ this.handleOpenModalChangePassword.bind(this) }>
            <Icon type="lock" /> &nbsp;{ t('messages.aml.changePwd') }
          </Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to={ '#' } onClick={ this.handleLogout.bind(this) }>
            <Icon type="logout" /> &nbsp;{ t('messages.aml.logout') }
          </Link>
        </Menu.Item>
      </Menu>
    )

    return (
      <div className="current-user">
        <Dropdown overlay={ dropdownMenu } overlayClassName="menu-current-user">
          <Button ghost>
            <Icon type="user" /> { currentUser.name } <Icon type="caret-down"/>
          </Button>
        </Dropdown>
        { this.state.isModalChangePasswordVisible &&
          <ModalChangePassword
            visible={ this.state.isModalChangePasswordVisible }
            onOk={ this.handleSaveModalChangePassword.bind(this) }
            onCancel={ this.handleCloseModalChangePassword.bind(this) }
            />
        }
      </div>
    )
  }
}

export default withRouter(withTranslation()(User))
