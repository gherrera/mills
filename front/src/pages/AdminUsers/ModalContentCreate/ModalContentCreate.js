import React from 'react'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Button, Col, Form, Icon, Input, notification, Row, Select, Tooltip } from 'antd'

class ModalContentCreate extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      id: '',
      name: '',
      email: '',
      type: '',
      login: '',
      password: '',
      token: null,
      status: 'ACTIVE',
      modules: [],
      isPasswordReset: false,
      client: {}
    }
  }

  async componentDidMount() {
    const { form } = this.props
    if (this.props.modalType === 'edit' || this.props.modalType === 'view') {
      this.setState({
        id: this.props.user.id,
        name: this.props.user.name,
        email: this.props.user.email,
        type: this.props.user.type,
        login: this.props.user.login,
        status: this.props.user.status,
        token: this.props.user.ticket,
        modules: this.props.user.modules !== null ? this.props.user.modules : [],
        //client: this.props.user.client
      })

      form.setFieldsValue({
        name: this.props.user.name,
        email: this.props.user.email,
        type: this.props.user.type,
        status: this.props.user.status,
        login: this.props.user.login,
        token: this.props.user.ticket,
        client: this.props.user.client && this.props.user.client.id
      })
    }else { //create
      this.setState({
        password: this.props.password
      })
      form.setFieldsValue({
        password: this.props.password
      })
    }

  }

  handleOnChange = (key, value) => {
    this.setState({ [key]: value })
  }

  handleOnChangeClient = (value) => {
    this.setState({ client: value ? {id: value }: {} })
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

    //if(modalType !== 'create') 
    options.push( <Select.Option value="ADMIN">Administrador</Select.Option>)
    options.push( <Select.Option value="CONTROLLER">Controlador</Select.Option>)
    options.push( <Select.Option value="DASHBOARD">Dashboard</Select.Option>)

    return options

  }

  handleCopyToClipboard = (id) => {
    const { t } = this.props

    let description = 'Copiado'

    if (id === 'username') {
      description = t('messages.mills.usernameCopiedToClipboard')
    }

    if (id === 'password') {
      description = t('messages.mills.passwordCopiedToClipboard')
    }

    notification['success']({
      message: t('messages.mills.notifications.succesfulOperation'),
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
    const { modalType, t, clients } = this.props

    return (
      <div>
        <Form onSubmit={this.handleSubmit.bind(this)} className="login-form" layout="inline">
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
                    onChange={(value) => this.handleOnChange('type', value)}
                    value={this.state.type}
                    disabled={modalType === 'view' || (this.state.type === 'ADMIN' && this.state.login === 'admin')}
                  >
                      {
                        this.getOptionsUsers()
                      }
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Nombre">
                {getFieldDecorator('name', {
                  rules: [
                    {
                      required: true,
                      message: t('messages.mills.mandatory'),
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
                      message: t('messages.mills.emailNotValid'),
                    },
                    {
                      required: true,
                      message: t('messages.mills.mandatory'),
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
                      message: t('messages.mills.mandatory'),
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
                  {getFieldDecorator('password', { 
                    rules: [
                      {
                        required: modalType === 'create',
                        message: t('messages.mills.mandatory'),
                      }
                    ]
                  })(
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
                        <Tooltip placement="top" title={t('messages.mills.copyPasswordToClipboard')}>
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
                        <Tooltip placement="top" title={t('messages.mills.copyPasswordToClipboard')}>
                          <CopyToClipboard text={this.props.password} onCopy={() => this.handleCopyToClipboard('password')}>
                            <Button type="primary">
                              <Icon type="copy" />
                            </Button>
                          </CopyToClipboard>
                        </Tooltip>
                      </Col>
                    </>
                    :
                    <Button type="primary" className="password-reset" onClick={this.handlePasswordReset.bind(this)}><Icon type="lock" /> {t('messages.mills.resetPassword')}</Button>
                  )
                  }
                </Form.Item>
              </Col>
            }

            { modalType !== 'create' &&
              <Col span={ 24 }>
                <Form.Item label="Estado">
                { getFieldDecorator('status', {
                  rules: [
                    {
                      required: true,
                      message: t('messages.mills.mandatory'),
                    },
                  ],
                })(
                  <Select
                      placeholder="Estado"
                      onChange={ (value) => this.handleOnChange('status', value) }
                      disabled={modalType === 'view' }
                    >
                      <Select.Option value="ACTIVE">{ t('messages.mills.status.ACTIVE') }</Select.Option>
                      <Select.Option value="INACTIVE">{ t('messages.mills.status.INACTIVE') }</Select.Option>
                    </Select>
                )}
                  </Form.Item>
              </Col>
            }

            { this.state.type === 'DASHBOARD' &&
              <Col span={ 24 }>
                <Form.Item label="Cliente">
                { getFieldDecorator('client', {
                  initialValue: this.props.user && this.props.user.client && this.props.user.client.id
                })(
                  <Select
                      placeholder="Cliente"
                      onChange={ (value) => this.handleOnChangeClient(value) }
                      disabled={modalType === 'view' }
                      allowClear
                    >
                      { clients.map(c => 
                        <Select.Option value={c.id}>{ c.name }</Select.Option>
                      )}
                    </Select>
                )}
                  </Form.Item>
              </Col>
            }
          </Row>
          <div className="ant-modal-footer">
            {modalType !== 'view' && <Button onClick={this.props.onCancel}>{t('messages.mills.cancel')}</Button>}
            {modalType !== 'view' ? <Button type="primary" htmlType="submit" className="login-form-button">{t('messages.mills.save')}</Button> : <Button onClick={() => this.props.onOk('view')} type="primary">Ok</Button>}
          </div>
        </Form>
      </div>
    )
  }
}

const WrappedTimeRelatedForm = Form.create({ name: 'create_new_user' })(ModalContentCreate)

export default withTranslation()(WrappedTimeRelatedForm)
