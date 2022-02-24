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
  saveMolino: (molino) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/saveMolino',
      method: 'post',
      body: molino
    })
  }
}
