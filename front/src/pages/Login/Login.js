import './Login.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Button, Col, Form, Icon, Input, notification, Row } from 'antd'
import { getAuthTokenPromise } from '../../promises'
import { resetPasswordPromise } from './promises'
import { authTokenSessionStorageSaverHelper } from '../../helpers'

class Login extends Component {
  state = {
    username: '',
    password: '',
    isLoading: false,
    isRestore: false
  }
  handleUsernameOnChange(username) {
    this.setState({ username })
  }

  handlePasswordOnChange(password) {
    this.setState({ password })
  }

  validateFields(fields) {
    const { form } = this.props

    return form.validateFields(fields, { force: true })
  }

  async handleSubmit(e) {
    e.preventDefault()

    await this.validateFields(['username', 'password'])

    this.setState({ isLoading: true })

    const { username, password } = this.state

    const authToken = await getAuthTokenPromise(username, password)

    this.setState({ isLoading: false })

    if (!authToken.error) {
      await authTokenSessionStorageSaverHelper(authToken)

      const { successHandler } = this.props

      await successHandler()
    }
  }

  renderFormItem = (formItem) => {
    const { getFieldDecorator } = this.props.form

    return (
      <Form.Item label={ formItem.label }>
        { getFieldDecorator(formItem.name, { rules: formItem.rules })(formItem.item) }
      </Form.Item>
    )
  }

  async handleSwitchToRestore(e) {
    e.preventDefault()

    await this.setState({ isRestore: true })
  }

  async handleSwitchToLogin(e) {
    e.preventDefault()

    await this.setState({ isRestore: false })
  }

  async handleRestorePassword(e) {
    e.preventDefault()

    const { t } = this.props

    await this.validateFields(['username'])

    await this.setState({ isLoading: true })

    const login = document.getElementById('login_form_username').value
    const reset = await resetPasswordPromise(login)

    if (reset.success) {
      notification.success({
        message: t('messages.aml.successfulOperation'),
        description: t('messages.aml.checkYourEmail')
      })

      window.setTimeout(async () => {
        await this.setState({ isRestore: false })
      }, 4500)
    } else {
      notification.error({
        message: t('messages.aml.anErrorOcurred'),
        description: t('messages.aml.usernameDoesNotExists')
      })
    }

    await this.setState({ isLoading: false })
  }

  render() {
    const { t } = this.props
    const { isLoading, isRestore } = this.state

    return (
      <div className="login-page">

{/* III.- TERCER BLOQUE - INICIO DE SESIÓN */  }
        <Row className="tercerBloque" id="iniciaS">
          <Col>
            <Form onSubmit={ isRestore ? this.handleRestorePassword.bind(this) : this.handleSubmit.bind(this) } className="login-form">
              <Row className="cajaIngreso">
                <Row className="row-image">
                  <img src="/logo.png" alt="" />
                </Row>
                <Row>
                    <Row id="ingresoUsuario">
                      {
                        this.renderFormItem({
                          name: 'username',
                          rules: [{ required: true, message: 'Campo requerido' }],
                          item: (
                            <Input
                              disabled={ false }
                              onChange={ (e) => this.handleUsernameOnChange.bind(this)(e.target.value) }
                              placeholder={ t('messages.aml.username') }
                              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                              />
                          )
                        })
                      }
                    </Row>
                    { !isRestore &&
                      <Row id="ingresoUsuario">
                        {
                          this.renderFormItem({
                              name: 'password',
                              rules: [{ required: true, message: 'Campo requerido' }],
                              item: (
                                <Input
                                  onChange={ (e) => this.handlePasswordOnChange.bind(this)(e.target.value) }
                                  type="password"
                                  autoComplete="off"
                                  placeholder={ t('messages.aml.password') }
                                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                />
                              )
                            })
                          }
                      </Row>
                                } 
                      <Row id="botonIngresar">
                          <Button htmlType="submit">Ingresar</Button>
                      </Row>
                      <Row className="olvidoCon">
                        { !isRestore && <a href='#' onClick={ this.handleSwitchToRestore.bind(this) }>{ t('messages.aml.forgotYourPassword') }</a> }
                          { isRestore && <a href='#' onClick={ this.handleSwitchToLogin.bind(this) }>{ t('messages.aml.backToLogin') }</a> }
                      </Row>
                  </Row>               
              </Row>
            </Form>
          </Col>
        </Row>
      </div>
    )
  }
}

const LoginForm = Form.create({ name: 'login_form' })(Login)


export default withTranslation()(withRouter(LoginForm))
