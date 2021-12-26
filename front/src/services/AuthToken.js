import apiConfig from '../config/api'
import { apiRequestorHelper } from '../helpers'

export default {
  create: (username, password, time) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/authenticate',
      method: 'post',
      body: {
        username,
        password,
        time
      }
    })
  },

  renew: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/refreshToken',
      method: 'post',
      body: {
        time: new Date().getTime()
      }
    })
  }
}
