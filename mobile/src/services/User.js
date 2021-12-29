import apiConfig from '../config/api'
import { apiRequestorHelper } from '../helpers'

export default {
  read: () => {
    return apiRequestorHelper({
      url: apiConfig.url+ '/currentUser',
      method: 'post'
    })
  },

  changePwd: (password, newpwd) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/changePwd',
      method: 'post',
      body: {
        password,
        newpwd
      }
    })
  },

  logout: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/logout',
      method: 'post'
    })
  },
  forgotPwd: (username) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/forgotPwd',
      method: 'post',
      body: {
        username
      }
    })
  }
}
