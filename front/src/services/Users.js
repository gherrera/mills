import apiConfig from '../config/api'
import { apiRequestorHelper } from '../helpers'

export default {

  read: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/users',
      method: 'post'
    })
  },

  delete: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/deleteUser',
      method: 'post',
      body: { id }
    })
  },

  saveUser: (mode, user) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/saveUser/' + mode,
      method: 'post',
      body: user
    })
  },

  getClients: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/clients',
      method: 'post'
    })
  }
}
