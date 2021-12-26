import apiConfig from '../../../../../config/api'
import { apiRequestorHelper } from '../../../../../helpers'

export default {
	getFormByClienteId: (from, size) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getFormByClienteId',
			method: 'post',
			body: {
				from,
				size
			}
		})
	},
	getFormById: (id) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getFormById/' + id,
			method: 'post'
		})
	},
	updateForm: (form) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/updateForm',
			method: 'post',
			body: form
		})
	},
	getFormHash: (id) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getFormHash/' + id,
			method: 'post'
		})
	}
}
