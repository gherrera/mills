import apiConfig from '../../../config/api'
import { apiRequestorHelper } from '../../../helpers'

export default {
  getMolinos: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getMolinos',
      method: 'post'
    })
  }
}
