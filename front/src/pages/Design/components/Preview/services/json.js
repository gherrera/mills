import apiConfig from '../../../../../config/api'
import { apiRequestorHelper } from '../../../../../helpers'

export default {
	getJsonSection: (section) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getJsonSection',
			method: 'post',
			body: section
		})
	},
	getJsonForm: (form) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getJsonForm',
			method: 'post',
			body: form
		})
	}
}
