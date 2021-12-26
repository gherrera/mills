import 'antd/dist/antd.css'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { I18nextProvider } from 'react-i18next'
import i18nextConfig from './config/i18next'
import moment from 'moment'
import 'moment/locale/es'
import { datasourcesContext } from './contexts'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { LayoutPrivate, LayoutPublic } from './layouts'
import { Loading, ModalChangePassword } from './layouts/Private/components'
import { AdminPage,HomePage, LoginPage, NotAuthorizedPage, NotFoundPage, DesignPage, Form, ManagePage, RecipientsPage, AdminUsersPage } from './pages'
import { LocalStorageService } from './services'
import { authTokenValidatorHelper, sessionStorageCleanerHelper, authTokenRenewerHelper } from './helpers'
import { animateLogoutPromise, changePasswordPromise, getCurrentUserPromise, logoutPromise, removeLoginAnimationsPromise } from './promises'
import { getDataSourcesCatalogoPromise, getDataSourcesFormPromise } from "./promises/";

class App extends Component {
  state = {
    currentUser: {},
    isActivated: true,
    isLoading: true,
    isLoggedIn: false,
    isModalChangePasswordVisible: false,
    datasources: {},
    datasourcesCat: {}
  }

  loadDatasourcesCatalogo() {
    getDataSourcesCatalogoPromise().then(ds => {
      let datasources = { }
      if(Object.keys(ds).length > 0) {
        datasources = { CAT: ds }
      }
      this.setState({ datasourcesCat: ds, datasources})
    })
  }

  loadFormDatasource(formId, callback) {
    getDataSourcesFormPromise(formId).then(ds => {
      const { datasources } = this.state
      if(Object.keys(ds).length > 0) {
        datasources.FORM = ds 
      }
      this.setState({ datasources })
      if(callback) callback()
    })
  }

  async componentDidMount() {
    const language = LocalStorageService.read('i18nextLng')
    moment.locale(language.substring(0,2))

    this.handleThemeCheck()
    //if(window && window.location && window.location.pathname && !window.location.pathname.startsWith("/forms")) {
        const isValidAuthToken = await authTokenValidatorHelper()

        if (isValidAuthToken) {
          const currentUser = await this.getCurrentUser()

          const isActivated = currentUser.feActivacion !== null
          if(isActivated) {
            this.setState({
              currentUser,
              isLoggedIn: true
            })

            removeLoginAnimationsPromise()

            const isActivated = currentUser.feActivacion !== null

            if (!isActivated) {
              this.handleOpenModalChangePassword()
            }

            //if (currentUser.client.pais !== 'CHI') {
            //  i18nextConfig.changeLanguage(language.substring(0,2) + currentUser.client.pais)
            //}
          }
        }
    //}
    this.loadDatasourcesCatalogo()
    await this.setState({ isLoading: false })
    
  }

  handleThemeCheck() {
    const theme = LocalStorageService.read('theme')

    if (theme !== null) {
      document.body.className = theme
    } else {
      document.body.className = 'theme-metal'
    }
  }

  async handleLogin() {
    const currentUser = await this.getCurrentUser()

    if (!currentUser.error) {
      const isActivated = currentUser.feActivacion !== null

      if (!isActivated) {
        this.handleOpenModalChangePassword()
      }else {
        await this.setState({
          currentUser,
          isLoggedIn: true
        })
        new authTokenRenewerHelper(this.handleLogout.bind(this))
      }
    }
  }

  async handleLogout() {
    await logoutPromise()
    await sessionStorageCleanerHelper()
    await animateLogoutPromise()

    await this.setState({
      currentUser: {},
      isActivated: true,
      isLoading: false,
      isLoggedIn: false
    })
  }

  async getCurrentUser() {
    const currentUser = await getCurrentUserPromise()

    this.setState({ isLoading: false })

    return currentUser
  }

  async handleOpenModalChangePassword() {
    this.setState({ isModalChangePasswordVisible: true })
  }

  async handleCloseModalChangePassword() {
    this.setState({ isModalChangePasswordVisible: false })
  }

  async handleSaveChangePassword(passwordCurrent, passwordNew, passwordNewConfirm) {
    await changePasswordPromise(passwordCurrent, passwordNew, passwordNewConfirm)

    this.setState({ isModalChangePasswordVisible: false })
  }

  renderComponent(CurrentPage, protectedContent) {
    const { isLoggedIn, currentUser } = this.state

    if (protectedContent && currentUser !== {} && currentUser.cliente !== undefined) {
      /*
      switch(protectedContent) {
        case 'service1':
          CurrentPage = (currentUser.tipoServicio !== null && currentUser.tipoServicio.includes('SERVICIO1')) ? CurrentPage : NotAuthorizedPage
          break
      }
      */
    }

    return isLoggedIn ? <CurrentPage currentUser={ currentUser } service={protectedContent} /> : <LoginPage successHandler={ this.handleLogin.bind(this) } />
  }

  render() {
    const { currentUser, isLoading, isLoggedIn, isModalChangePasswordVisible, datasources } = this.state
    const Layout = isLoggedIn ? LayoutPrivate : LayoutPublic

    if (isLoading) {
      return <Loading />
    } else {
      return (
        <I18nextProvider i18n={ i18nextConfig }>
          <datasourcesContext.Provider value={{ currentUser, datasources, loadFormDatasource: this.loadFormDatasource.bind(this) }} >
            <Router>
              <Layout currentUser={ currentUser } logoutHandler={ this.handleLogout.bind(this) }>
                <Switch>
                  <Route path="/" exact render={ () => this.renderComponent(HomePage) } />
                  <Route path="/admin" exact render={ () => this.renderComponent(AdminPage) } />
                  <Route path="/accounts" exact render={ () => this.renderComponent(AdminUsersPage) } />
                  <Route path="/design" exact render={ () => this.renderComponent(DesignPage, 'design') } />
                  <Route path="/manage/:status?" exact render={ () => this.renderComponent(ManagePage, 'manage') } />
                  <Route path="/recipients" exact render={ () => this.renderComponent(RecipientsPage, 'recipients') } />
                  <Route path="/forms/:id/:view?" exact render={ () => <Form /> } />
                  <Route path="/form/:hash" exact render={ () => <Form /> } />

                  <Route render={ () => <NotFoundPage /> } />
                </Switch>
                <ModalChangePassword
                  visible={ isModalChangePasswordVisible }
                  onOk={ this.handleSaveChangePassword.bind(this) }
                  onCancel={ this.handleCloseModalChangePassword.bind(this) }
                  isForced
                  />
              </Layout>
            </Router>
          </datasourcesContext.Provider>
        </I18nextProvider>
      )
    }
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
