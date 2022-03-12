import './ModalChangePassword.scss'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Button, Divider, Form, Icon, Input, Modal } from 'antd'

class ModalChangePassword extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      passwordCurrent: '',
      passwordNew: '',
      passwordNewConfirm: ''
    }
  }

  handlePasswordCurrentOnChange(passwordCurrent) {
    this.setState({ passwordCurrent })
  }

  handlePasswordNewOnChange(passwordNew) {
    this.setState({ passwordNew })
  }

  handlePasswordNewConfirmOnChange(passwordNewConfirm) {
    this.setState({ passwordNewConfirm })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { visible } = this.props
    const { onOk } = this.props
    const { onCancel } = this.props
    const { isForced } = this.props
    const { t } = this.props

    return (
      <Modal
        title={ [ <Icon type="lock" />, ' ', 'Cambiar contraseña' ] }
        className={ ( isForced ? 'forced' : 'normal' ) + ' modal-change-password' }
        visible={ visible }
        footer={ [
          <Button onClick={ () => onCancel() }>
            Cerrar
          </Button>
          ,
          <Button key="submit" type="primary" onClick={ () => onOk(this.state.passwordCurrent, this.state.passwordNew, this.state.passwordNewConfirm) }>
            { t('messages.mills.save') }
          </Button>
        ] }
        onCancel={ onCancel }
        onOk={ onOk }
        >
        { isForced &&
            <p>Se requiere cambiar la contraseña.</p>
        }
        <Form.Item>
          { getFieldDecorator('password-current', {
            rules: [{
              required: true,
              message: 'Por favor, ingrese la contraseña actual.'
            }],
          })(
            <Input
              prefix={ <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} /> }
              type="password"
              placeholder="Contraseña actual"
              onChange={ (e) => this.handlePasswordCurrentOnChange.bind(this)(e.target.value) }
            />
          )}
        </Form.Item>
        <Divider />
        <div className="new-pass-input-group">
          <Form.Item>
            { getFieldDecorator('password-new', {
              rules: [{
                required: true,
                message: 'Por favor, ingrese una nueva contraseña.'
              }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Nueva contraseña"
                onChange={ (e) => this.handlePasswordNewOnChange.bind(this)(e.target.value) }
              />,
            )}
          </Form.Item>
          <Form.Item>
            { getFieldDecorator('password-new-repeat', {
              rules: [{
                required: true,
                message: 'Por favor, confirme la nueva contraseña.'
              }]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Confirmar contraseña"
                onChange={ (e) => this.handlePasswordNewConfirmOnChange.bind(this)(e.target.value) }
              />
            )}
          </Form.Item>
        </div>
      </Modal>
    )
  }
}

const WrappedChangePasswordForm = Form.create({ name: 'change_password_form' })(ModalChangePassword)

export default withTranslation()(withRouter(WrappedChangePasswordForm))
