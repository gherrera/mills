import './Login.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { Button, Col, Form, Icon, Input, notification, Row, Spin } from 'antd'
import { getAuthTokenPromise } from '../../promises'
import { resetPasswordPromise } from './promises'
import { authTokenSessionStorageSaverHelper } from '../../helpers'
import TextArea from 'antd/lib/input/TextArea'

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

{/* I.- HEADER */}
<Row className="header">
  <a href="" class="logo">
        <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/Logo-e1627334345137.png" alt="" id="logoHeader" />
  </a>
  <input class="menu-btn" type="checkbox" id="menu-btn" />
  <label class="menu-icon" for="menu-btn"><span class="navicon"></span></label>
  <ul class="menu">
    <li><a href="#comof" id="textoMenu">¿Cómo funciona?</a></li>
    <li><a href="#iniciaS" id="textoMenu">Inicia Sesión</a></li>
    <li><a href="#servicioC" id="textoMenu">Servicio al Cliente</a></li>
  </ul>
</Row>

{/* II.- PRIMER BLOQUE - BENEFICIOS */}
        <Row className="primerBloque">
          <Row className="tituloprimerBloque">
              <h2 id="titulo1B">
                La forma mas fácil de diseñar <span id="cualquier">cualquier tipo</span> de FORMULARIO
              </h2>      
          </Row>
          <Row className="principalesBeneficios">
              <Col className="textoprincipalesBeneficios" span={8} xs={24} sm={24} md={8} lg={8}>
                <Row className="beneficios">
                    <img src="https://htgsoluciones.com/wp-content/uploads/elementor/thumbs/Icono-Formulario-Naranjo-version-5-panhw7ghiho02f5gj67lmwwq85vtfjb1op0f34dg1g.png" alt="" id="logoPB" />
                </Row>
                <Row className="beneficios">
                    <h3 id="tituloPB">
                        Crea
                    </h3>
                </Row>
                <Row className="beneficios">
                    <p id="parrafoPB">
                        Diseña tus formularios a medida sin restricciones, accede a un catalogo de datos prediseñados, plantillas predefinidas y validaciones pre cargadas. Visualiza tu formulario en cualquier momento y modifícalo cuando lo necesites.
                    </p>
                </Row>
              </Col>
              <Col className="textoprincipalesBeneficios" span={8} xs={24} sm={24} md={8} lg={8}>
                <Row className="beneficios">
                    <img src="https://htgsoluciones.com/wp-content/uploads/elementor/thumbs/Icono-Formulario-Naranjo-version-5-panhw7ghiho02f5gj67lmwwq85vtfjb1op0f34dg1g.png" alt="" id="logoPB" />
                </Row>
                <Row className="beneficios">
                    <h3 id="tituloPB">
                        Envía
                    </h3>
                </Row>
                <Row className="beneficios">
                    <p id="parrafoPB">
                    Organiza tus formularios por categoría de destinatarios. Realiza un envío masivo de solicitudes. Envía recordatorios. Haz seguimiento en línea al avance. Administra un historial por formulario.
                    </p>
                </Row>
              </Col>
              <Col className="textoprincipalesBeneficios" span={8} xs={24} sm={24} md={8} lg={8}>
                <Row className="beneficios">
                    <img src="https://htgsoluciones.com/wp-content/uploads/elementor/thumbs/Icono-Formulario-Naranjo-version-5-panhw7ghiho02f5gj67lmwwq85vtfjb1op0f34dg1g.png" alt="" id="logoPB" />
                </Row>
                <Row className="beneficios">
                    <h3 id="tituloPB">
                        Gestiona
                    </h3>
                </Row>
                <Row className="beneficios">
                    <p id="parrafoPB">
                    Administra los formularios desde el envío hasta que son completados. Descarga los comprobantes o la información contenida. Visualiza la información en la plataforma. Administra un historial por declarante.
                    </p>
                </Row>
              </Col>
          </Row>
        </Row>

{/* III.- SEGUNDO BLOQUE - FUNCIONAMIENTO */}
        <Row className="segundoBloque" id="comof">
          <Row className="titulosegundoBloque">
              <h2 id="titulo2B">
                ¿Cómo Funciona?
              </h2>      
          </Row>
          <Row className="funciona1">
              <Col className="imagenBox" span={8} xs={24} sm={24} md={8} lg={8}>
                  <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/port6-300x225.jpg" alt="" id="imagenF" />
              </Col>
              <Col className="contenidoBox" span={8} xs={24} sm={24} md={8} lg={8}>
                  <Row className="tituloBox">
                    <h3 id="tituloF">
                        Desarrolla tus propios formularios
                    </h3>
                  </Row>
                  <Row className="parrafoBox">
                    <p id="parrafoF">
                        Utiliza nuestro módulo de diseño para digitalizar cualquier tipo de formulario o crear uno nuevo en funcion de tus necesidades de información.
                    </p>
                  </Row>
              </Col>
              <Col className="contenidoBox" span={8} xs={24} sm={24} md={8} lg={8}>
                  <Row className="tituloBox">
                    <h3 id="tituloF">
                        Galería de campos y secciones a tu disposición
                    </h3>
                  </Row>
                  <Row className="parrafoBox">
                    <p id="parrafoF">
                        Cuentas con una diversidad de campos listos para utilizar. Secciones prediseñadas para ahorrar tiempo. Sólo requieres incorporar el texto que necesites y definir los campos que lo componen.
                    </p>
                  </Row>
              </Col>  
          </Row>
          <Row className="funciona2">
              <Col className="contenidoBox" span={8} xs={24} sm={24} md={8} lg={8}>
                  <Row className="tituloBox">
                    <h3 id="tituloF">
                        Envía las solicitudes a quien necesites
                    </h3>
                  </Row>
                  <Row className="parrafoBox">
                    <p id="parrafoF">
                    Haz seguimiento a los formularios que enviaste o manda recordatorios. Mantén trazabilidad de cada actividad realizada.
                    </p>
                  </Row>
              </Col>
              <Col className="imagenBox" span={8} xs={24} sm={24} md={8} lg={8}>
                  <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/port6-300x225.jpg" alt="" id="imagenF" />
              </Col>
              <Col className="contenidoBox" span={8} xs={24} sm={24} md={8} lg={8}>
                  <Row className="tituloBox">
                    <h3 id="tituloF">
                       Comprobantes y datos a tu disposición
                    </h3>
                  </Row>
                  <Row className="parrafoBox">
                    <p id="parrafoF">
                        Lo declarado se registra en un comprobante en formato pdf. Así mismo tienes acceso inmediato a la datos registrados.
                    </p>
                  </Row>
              </Col>  
          </Row>
          <Row className="funciona3">
              <Col id="contenidoBox" span={16} xs={24} sm={24} md={16} lg={16}>
                  <Row className="tituloBox">
                    <h3 id="tituloF">
                        Automatiza la entrada y salida de datos
                    </h3>
                  </Row>
                  <Row className="parrafoBox">
                    <p id="parrafoF">
                        Integra tus plataformas con Formularia, registra tus destinatarios enviado la información vía API, así mismo la totalidad de la información completada en los formularios la cual puede ser envíada por esta misma vía directamente a tus sistemas.
                    </p>
                  </Row>
              </Col>
              <Col className="imagenBox" span={8} xs={24} sm={24} md={8} lg={8}>
                  <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/port6-300x225.jpg" alt="" id="imagenF" />
              </Col>
          </Row>
        </Row>

{/* III.- TERCER BLOQUE - INICIO DE SESIÓN */  }
        <Row className="tercerBloque" id="iniciaS">
          <Col span={2} xs={24} sm={16} md={2} lg={2}>
          </Col>
          <Col className="seccionSesion" span={8} xs={24} sm={16} md={8} lg={8}>
            <Row>  
              <h4 id="tituloS">
                        Inicia Sesión
              </h4>
            </Row>
            <Row>  
              <span id="separadorS"></span>
            </Row>
            <Row>  
              <h5 id="parrafoS">
                        Bienvenido a Formularia, a continuación ingrese su correo electrónico y contraseña
              </h5>
            </Row>
          </Col>
          <Col className="seccionIngreso" span={11} xs={24} sm={16} md={11} lg={11}>
          <Form onSubmit={ isRestore ? this.handleRestorePassword.bind(this) : this.handleSubmit.bind(this) } className="login-form">
            <Row className="cajaIngreso">
              <Row className="cajaAzulIngreso">
                <Row className="cajaAzulIngresoAnt">
                  <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/Texto-Logo-e1627334600382-1024x128.png" alt="" id="logoIngreso" />
                </Row>
              </Row>
              <Row className="cajaContraseña">
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
                                           />
                                        )
                                      })
                                    }
                  </Row>
                              } 
                  <Row>
                      <Button id="botonIngresar" htmlType="submit">Ingresar</Button>
                  </Row>
                  <Row className="olvidoCon">
                     { !isRestore && <a href='#' id="olvidoC" onClick={ this.handleSwitchToRestore.bind(this) }>{ t('messages.aml.forgotYourPassword') }</a> }
                      { isRestore && <a href='#' id="olvidoC" onClick={ this.handleSwitchToLogin.bind(this) }>{ t('messages.aml.backToLogin') }</a> }
                  </Row>
                </Row>               
            </Row>
          </Form>
          </Col>
          <Col span={2} xs={24} sm={16} md={2} lg={2}>
          </Col>
        </Row>

{/* IV.- CUARTO BLOQUE - CONTACTANOS */}
<Row className="cuartoBloque">
          <Col span={2} xs={24} sm={24} md={2} lg={2}>
          </Col>
          <Col className="columnaContacto" span={20} xs={24} sm={24} md={20} lg={20}>
              <Row className="cajaContacto" type="flex" justify="space-around" align="middle">
                  <Col className="seccionContacto" span={11} xs={24} sm={24} md={11} lg={11}>
                        <h6 id="tienes">¿Tienes una pregunta?</h6>
                        <h7 id="tituloC">Contáctanos</h7>
                        <p id="parrafoC">Comunícate con nuestra área especializada de soporte, estamos disponibles para recibir tus consultas y asesorarte</p>
                  </Col>
                  <Col span={13} xs={24} sm={24} md={13} lg={13}>
                        <Row className="ordenContacto">
                              <Col span={8} xs={24} sm={8} md={8} lg={8}>
                                    <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/Icono-Correo.png" alt="" id="iconoContacto" />
                              </Col>
                              <Col span={16} xs={24} sm={16} md={16} lg={16}>
                                    <h10 id="tituloContacto">Envianos un correo a:</h10>
                                    <p id="parrafoContacto">soporte@htgsoluciones</p>
                              </Col>          
                        </Row>
                        <Row className="ordenContacto">
                              <Col span={8} xs={24} sm={8} md={8} lg={8}>
                                    <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/Icono-Telefono.png" alt="" id="iconoContacto" />
                              </Col>
                              <Col span={16} xs={24} sm={16} md={16} lg={16}>
                                    <h11 id="tituloContacto">Comunícate con nosotros a:</h11>
                                    <p id="parrafoContacto">+56 9 1000 0000</p>
                              </Col>               
                        </Row>
                        <Row className="ordenContacto">
                              <Col span={8} xs={24} sm={8} md={8} lg={8}>
                                    <img src="https://htgsoluciones.com/wp-content/uploads/2021/08/Icono-reloj.png" alt="" id="iconoContacto" />
                              </Col>
                              <Col span={16} xs={24} sm={16} md={16} lg={16}>
                                    <h12 id="tituloContacto">Horarios de atención</h12>
                                    <p id="parrafoContacto">De lunes a viernes: 9:00 a 18:00 horas</p>
                              </Col>            
                        </Row>
                    </Col>
                </Row>
          </Col>
          <Col span={2} xs={24} sm={16} md={2} lg={2}>
          </Col>
      </Row>

{/* V.- FOOTER*/}
<Row className="footer1" type="flex" justify="space-around" align="middle">
          <Col className="logoBox1" span={6} xs={24} sm={6} md={6} lg={6}>
              <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/logo-white-e1627335689960-300x103.png" alt="" id="logoHtgFooter1" />
          </Col>
          <Col className="HTGBox1" span={8} xs={24} sm={8} md={8} lg={8}>
              <img src="https://htgsoluciones.com/wp-content/uploads/2021/07/Logo-e1627334345137-1024x199.png" alt="" id="logoForFooter1" />
              <p id="parrafoFooter1">
                    Es una plataforma creada por HTG Soluciones, empresa que busca proponer iniciativas de transformación digital enfocada en optimizar los procesos de tu negocio.
              </p>
          </Col>
          <Col className="demoBox1" span={6} xs={24} sm={6} md={6} lg={6}>
              <h6 id="solicite1">
                Solicite una demostración
              </h6>
              <p id="comuniquese1">
                Comuníquese con nosotros:
              </p>
              <li id="quitar1">
                <span id="iconoCorreo1"><Icon size="small" type="mail"/></span>
                <span id="textoicono1">contacto@htgsoluciones.com</span>
              </li>
              <li id="quitar1">
                <span id="iconoTelefono1"><Icon size="small" type="phone"/></span>
                <span id="textoicono1">+56-9-7910000</span>
              </li>
          </Col>
          <Col className="politicas1" span={4} xs={24} sm={4} md={4} lg={4}>
                    <a href="https://htgsoluciones.com/politica-de-uso/" target="_blank" id="usoLink1">Política de Uso</a>
                    <p id="copyrightMensaje1">
                      Copyright © - HTG Soluciones - Todos los derechos reservados
                    </p>
          </Col>
      </Row>



{/* Final Inicio Arreglos Guille, página nueva */}
      </div>
    )
  }
}

const LoginForm = Form.create({ name: 'login_form' })(Login)


export default withTranslation()(withRouter(LoginForm))
