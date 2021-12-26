import apiConfig from '../../../../../config/api'
import { apiRequestorHelper } from '../../../../../helpers'

export default {
	getFormById: (id) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getFormById/' + id,
			method: 'post'
		})
	},
	saveForm: (form) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/saveForm',
			method: 'post',
			body: form
		})
	},
	saveSection: (section) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/saveSection',
			method: 'post',
			body: section
		})
	},
	generateForm: (id, dest) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/generateForm/'+id,
			method: 'post',
			body: dest
		})
	}
}
