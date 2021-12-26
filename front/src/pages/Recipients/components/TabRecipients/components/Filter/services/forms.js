import apiConfig from '../../../../../../../config/api'
import { apiRequestorHelper } from '../../../../../../../helpers'

export default {
	getFormNames: () => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getFormNames',
			method: 'post'
		})
	}
}
