import apiConfig from '../../../config/api'
import { apiRequestorHelper } from '../../../helpers'

export default {
  getMolinos: (status) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getMolinos',
      method: 'post',
      body: {
        status
      }
    })
  },
  getMolino: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getMolino',
      method: 'post',
      body: {
        id
      }
    })
  },
  saveMolino: (molino) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/saveMolino',
      method: 'post',
      body: molino
    })
  }
}
