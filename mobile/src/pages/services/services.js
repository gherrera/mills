import apiConfig from '../../config/api'
import { apiRequestorHelper } from '../../helpers'

export default {
  getTurnosActivos: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getTurnosActivosController',
      method: 'post'
    })
  },
}
