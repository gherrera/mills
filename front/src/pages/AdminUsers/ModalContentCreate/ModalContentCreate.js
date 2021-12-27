import React from 'react'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Button, Col, Form, Icon, Input, notification, Row, Select, Switch, Tabs, Tooltip } from 'antd'
import { resetPasswordPromise } from '../../Login/promises'

class ModalContentCreate extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      id: '',
      name: '',
      email: '',
      type: '',
      login: '',
      password: props.password,
      token: null,
      status: 'ACTIVE',
      modules: [],
      isPasswordReset: false
    }
  }

  async componentDidMount() {
    if (this.props.modalType === 'edit' || this.props.modalType === 'view') {
      const { form } = this.props
      this.setState({
        id: this.props.user.id,
        name: this.props.user.name,
        email: this.props.user.email,
        type: this.props.user.type,
        login: this.props.user.login,
        status: this.props.user.status,
        token: this.props.user.ticket,
        modules: this.props.user.modules !== null ? this.props.user.modules : []
      })

      form.setFieldsValue({
        name: this.props.user.name,
        email: this.props.user.email,
        type: this.props.user.type,
        status: this.props.user.status,
        login: this.props.user.login,
        token: this.props.user.ticket
      })
    }
  }

  handleOnChange = async (key, value) => {
    await this.setState({ [key]: value })
  }

  handleOnChangeType = (value) => {
    this.setState({ type: value })
  }

  handleOnChangeStatus = (value) => {
    this.setState({ status: value })
  }

  handleUsernameOnKeyDown = (e) => {
    const char = String.fromCharCode(e.which)

    if (e.which === 16) {
      e.preventDefault()
    } else {
      if (e.which !== 190 && e.which !== 8 && e.which !== 189) {
        if (!(/^[A-Za-z0-9_.]+$/.test(char))) {
          e.preventDefault()
        }
      }
    }
  }

  handleOnChangeModule = (key, checked) => {
    const modules = this.state.modules

    if (checked && !modules.includes(key)) {
      modules.push(key)
    }
    if (!checked && modules.includes(key)) {
      let index = modules.indexOf(key)
      modules.splice(index, 1)
    }
    this.setState({ modules })
  }

  getOptionsUsers = () => {
    const { t, currentUser, modalType } = this.props
    let options = []

    if(modalType !== 'create') options.push( <Select.Option value="ADMIN">Administrador</Select.Option>)
    options.push( <Select.Option value="CONTROLLER">Controlador</Select.Option>)

    return options

  }

  handleCopyToClipboard = (id) => {
    const { t } = this.props

    let description = 'Copiado'

    if (id === 'username') {
      description = t('messages.aml.usernameCopiedToClipboard')
    }

    if (id === 'password') {
      description = t('messages.aml.passwordCopiedToClipboard')
    }

    notification['success']({
      message: t('messages.aml.notifications.succesfulOperation'),
      description
    })
  }

  handlePasswordReset = async () => {
    this.setState({
      isPasswordReset: true,
      password: this.props.password
    })
  }

  async handleSubmit(e) {
    e.preventDefault()

    const { form } = this.props

    form.validateFields(['name', 'email', 'type', 'login'], { force: true });

    if (!this.state.name.length || !this.state.email.length || !this.state.type.length || !this.state.login.length) {
      notification['error']({
        message: 'Ha ocurrido un error',
        description: 'Uno o mas campos requeridos no han sido completados.'
      })
    } else {
      this.props.onOk(this.props.modalType, this.state)
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { modalType } = this.props
    const { t } = this.props

    return (
      <div>
        <Form onSubmit={this.handleSubmit.bind(this)} className="login-form" layout="inline">
          <Tabs type="card">
            <Tabs.TabPane tab={[<Icon type="info-circle" />, t('messages.aml.information')]} key="1">
              <Row gutter={[8]}>
                <Col span={24}>
                  <Form.Item label="Perfil">
                    {getFieldDecorator('type', {
                      rules: [
                        {
                          required: true,
                          message: 'Perfil es obligatorio',
                        },
                      ],
                    })(
                      <Select
                        className="type"
                        showSearch
                        placeholder="Perfil"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={(value) => this.handleOnChangeType(value)}
                        value={this.state.type}
                        disabled={modalType === 'view' || this.state.type === 'ADMIN'}
                      >
                          {
                            this.getOptionsUsers()
                          }
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label={t('messages.aml.name')}>
                    {getFieldDecorator('name', {
                      rules: [
                        {
                          required: true,
                          message: t('messages.aml.nameMandatory'),
                        },
                      ],
                    })(<Input value={this.state.name} onChange={(e) => this.handleOnChange('name', e.target.value)} disabled={modalType === 'view'} />)}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="E-mail">
                    {getFieldDecorator('email', {
                      rules: [
                        {
                          type: 'email',
                          message: t('messages.aml.emailNotValid'),
                        },
                        {
                          required: true,
                          message: t('messages.aml.emailMandatory'),
                        },
                      ],
                    })(
                      <Input
                        onChange={(e) => this.handleOnChange('email', e.target.value)}
                        value={this.state.email}
                        disabled={modalType === 'view'}
                      />
                    )
                    }
                  </Form.Item>
                </Col>                 
                <Col xs={24}>
                  <Form.Item className="username" label="Usuario">
                    {getFieldDecorator('login', {
                      rules: [
                        {
                          required: true,
                          message: t('messages.aml.loginMandatory'),
                        }
                      ],
                    })(
                      <div className="username-wrapper">
                        <Input
                          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                          className="username-input"
                          maxlength="20"
                          onKeyDown={this.handleUsernameOnKeyDown}
                          onChange={(e) => this.handleOnChange('login', e.target.value.toLowerCase())}
                          value={this.state.login}
                          disabled={modalType === 'view'}
                        />
                      </div>
                    )
                    }
                  </Form.Item>
                </Col>
                {(modalType === 'edit' || modalType === 'create') &&
                  <Col xs={24}>
                    <Form.Item label="Contraseña">
                      {getFieldDecorator('password')(
                        modalType === 'create' ?
                        <>
                          <Col span={17}>
                            <Input
                              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                              value={this.state.password}
                              onChange={(e) => this.handleOnChange('password', e.target.value)}
                            />
                          </Col>
                          <Col span={6} offset={1}>
                            <Tooltip placement="top" title={t('messages.aml.copyPasswordToClipboard')}>
                              <CopyToClipboard text={this.props.password} onCopy={() => this.handleCopyToClipboard('password')}>
                                <Button type="primary">
                                  <Icon type="copy" />
                                </Button>
                              </CopyToClipboard>
                            </Tooltip>
                          </Col>
                        </>
                        : this.state.isPasswordReset ?
                        <>
                          <Col span={17}>
                            <Input
                              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                              value={this.state.password}
                              onChange={(e) => this.handleOnChange('password', e.target.value)}
                            />
                          </Col>
                          <Col span={6} offset={1}>
                            <Tooltip placement="top" title={t('messages.aml.copyPasswordToClipboard')}>
                              <CopyToClipboard text={this.props.password} onCopy={() => this.handleCopyToClipboard('password')}>
                                <Button type="primary">
                                  <Icon type="copy" />
                                </Button>
                              </CopyToClipboard>
                            </Tooltip>
                          </Col>
                        </>
                        :
                        <Button type="primary" className="password-reset" onClick={this.handlePasswordReset.bind(this)}><Icon type="lock" /> {t('messages.aml.resetPassword')}</Button>
                      )
                      }
                    </Form.Item>
                  </Col>
                }

                { modalType !== 'create' &&
                  <Col span={ 24 }>
                    <Form.Item label={ t('messages.aml.status') }>
                    { getFieldDecorator('status', {
                      rules: [
                        {
                          required: true,
                          message: t('messages.aml.status'),
                        },
                      ],
                    })(
                      <Select
                          placeholder={ t('messages.aml.status') }
                          onChange={ (value) => this.handleOnChangeStatus(value) }
                          value={ this.state.status }
                          disabled={modalType === 'view' }
                        >
                          <Select.Option value="ACTIVE">{ t('messages.aml.rule.status.ACTIVE') }</Select.Option>
                          <Select.Option value="INACTIVE">{ t('messages.aml.rule.status.INACTIVE') }</Select.Option>
                        </Select>
                    )}
                      </Form.Item>
                  </Col>
                }
              </Row>
            </Tabs.TabPane>
            {/*
            <Tabs.TabPane tab={[<Icon type="lock" />, 'Permisos']} key="2">
              <Row gutter={[8]}>
                
                <Col span={24}>
                  <Form.Item label="Informes">
                    {getFieldDecorator('reports', {
                    })(
                      <Switch onChange={(checked) => this.handleOnChangeModule('REPORT', checked)} defaultChecked={this.state.modules.includes('REPORT') ? true : false} disabled={modalType === 'view'} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>
            */}
          </Tabs>
          <div className="ant-modal-footer">
            {modalType !== 'view' && <Button onClick={this.props.onCancel}>{t('messages.aml.cancel')}</Button>}
            {modalType !== 'view' ? <Button type="primary" htmlType="submit" className="login-form-button">{t('messages.aml.save')}</Button> : <Button onClick={() => this.props.onOk('view')} type="primary">Ok</Button>}
          </div>
        </Form>
      </div>
    )
  }
}

const WrappedTimeRelatedForm = Form.create({ name: 'create_new_user' })(ModalContentCreate)

export default withTranslation()(WrappedTimeRelatedForm)
