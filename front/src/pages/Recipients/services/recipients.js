import apiConfig from '../../../config/api'
import { apiRequestorHelper } from '../../../helpers'

export default {
	getRecipientsByClienteId: (from, size, params) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getRecipientsByClienteId',
			method: 'post',
			body: {...params, from, size }
		})
	},
	getRecipientById: (id) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getRecipientById/' + id,
			method: 'post'
		})
	},
	deleteRecipient: (id) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/deleteDestinatario',
			method: 'post',
			body: {
				id
			}
		})
	},
	updateRecipient: (rec) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/updateRecipient',
			method: 'post',
			body: rec
		})
	},
	addComment: (id, comments) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/addCommentDest',
			method: 'post',
			body: {
				id,
				comments
			}
		})
	}
}
