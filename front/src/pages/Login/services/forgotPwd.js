import apiConfig from '../../../config/api'
import { apiRequestorHelper } from '../../../helpers'

export default {
  create: (username) => {
    return apiRequestorHelper({
      url: apiConfig.urlAml + '/forgotPwd',
      method: 'post',
      body: {
        username
      }
    })
  }
}
