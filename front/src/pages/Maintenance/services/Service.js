import apiConfig from '../../../config/api'
import { apiRequestorHelper } from '../../../helpers'

export default {
  getMolinos: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getMolinos',
      method: 'post'
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
