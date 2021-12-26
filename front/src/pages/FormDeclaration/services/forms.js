import apiConfig from '../../../config/api'
import { apiRequestorHelper } from '../../../helpers'

export default {
	saveSectionValues: (formId, section) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/saveSectionValues/'+formId,
			method: 'post',
			body: section
		})
	},
	sendForm: (formId) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/sendForm/'+formId,
			method: 'post'
		})
	}
}
