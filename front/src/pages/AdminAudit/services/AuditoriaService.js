import apiConfig from '../../../config/api'
import { apiRequestorHelper } from '../../../helpers'

export default {
  read: (fromNum = undefined, resultsPerPage = undefined, filters = undefined) => {
    let requestBody = {
      url: apiConfig.urlAml + '/historyByClient',
      method: 'post',
      body: {
        from: fromNum,
        size: resultsPerPage
      }
    }

    if (filters !== null) {
      for (let key in filters) {
        requestBody.body[key] = filters[key]
      }
    }

    return apiRequestorHelper(requestBody)
  }
}
