import React from 'react'
//import { Button, notification } from 'antd'
import { AuthTokenService, SessionStorageService } from '../services'

export default class {
  constructor(logoutHandler) {
    this.logoutHandler = logoutHandler
    //this.originalPageTitle =  (' ' + document.title).slice(1)

    this.run()
  }

  run() {
    //document.title = this.removeNumberFromTitle()

    this.startingTime = new Date().getTime()
    this.authTokenExpirationDate = SessionStorageService.read('authTokenExpirationDate')
    this.authTokenLongevity = this.authTokenExpirationDate - this.startingTime
    this.notificationSeconds = 30

    this.idleTimer()
  }

  verifySession(authToken) {
    let authTokenStored = SessionStorageService.read('authToken')
    if(authTokenStored === authToken) {
      const latestApiRequestDate = SessionStorageService.read('latestApiRequestDate')
      const authTokenExpirationDate = SessionStorageService.read('authTokenExpirationDate')
      const idleTime = authTokenExpirationDate - latestApiRequestDate

      if (idleTime > (this.authTokenLongevity / 2)) {
        //this.renderNotification(this.notificationSeconds)
        this.handleNotificationTimer()
      } else {
        this.handleRenew()
      }
    }
  }

  idleTimer() {
    let authToken = SessionStorageService.read('authToken')
    this.iTimer = window.setTimeout(() => this.verifySession(authToken), (this.authTokenLongevity - 30000))
  }

  /*
  renderNotification(seconds) {
    const btn = <Button type="primary" size="small" onClick={ this.handleRenew }>Mantener la sesión.</Button>

    notification['warning']({
      key: 'updatable',
      message: 'Su sesión expirará en ' + seconds + ' segundos.',
      description: 'Por favor, confirme para continuar con la sesión.',
      duration: 0,
      btn
    })
  }
  */

  handleNotificationTimer() {
    //document.title = this.removeNumberFromTitle()
    //document.title = this.prependNumberToTitle()

    this.countdown = window.setTimeout(() => {
      if (this.notificationSeconds > 1) {
        this.notificationSeconds--
        //this.renderNotification(this.notificationSeconds)
        this.handleNotificationTimer()
      } else {
        //notification.close('updatable')

        clearTimeout(this.iTimer)
        clearTimeout(this.countdown)

        //document.title = this.originalPageTitle

        this.logoutHandler()
      }
    }, 1000)
  }

  /*
  prependNumberToTitle() {
    let currentTitle = (' ' + document.title).slice(1)
    let newTitle = '(' + this.notificationSeconds + ') ' + currentTitle

    return newTitle
  }

  removeNumberFromTitle() {
    let newTitle = this.originalPageTitle

    return newTitle
  }
  */

  handleRenew = async () => {
    await AuthTokenService.renew()
      .then(response => {
        SessionStorageService.update('authToken', response.data.token)
        SessionStorageService.update('authTokenExpirationDate', response.data.expirationDate)

        clearTimeout(this.iTimer)
        clearTimeout(this.countdown)

        //notification.close('updatable')

        this.run()
      })
      .catch(err => console.log(err))
  }
}
