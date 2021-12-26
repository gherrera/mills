import apiConfig from '../config/api'
import { apiRequestorHelper } from '../helpers'

export default {
  catalogo: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getDataSourcesCatalogo',
      method: 'post'
    })
  },
  form: (formId) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getDataSourcesForm/'+formId,
      method: 'post'
    })
  }
}
