import apiConfig from '../config/api'
import { apiRequestorHelper } from '../helpers'

export default {
	getFormHash: (hash) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getFormIdHash/' + hash,
			method: 'post'
		})
	},
	getDestinatarioByRut: (clienteId, rut) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/getDestinatarioByRut',
			method: 'post',
			body: {
				clienteId,
				rut
			}
		})
	},
	stats: () => {
		return apiRequestorHelper({
			url: apiConfig.url + '/stats',
			method: 'post'
		})
	},
	statsCategory: () => {
		return apiRequestorHelper({
			url: apiConfig.url + '/statsCategory',
			method: 'post'
		})
	},
	statsCategoryStatus: () => {
		return apiRequestorHelper({
			url: apiConfig.url + '/statsCategoryStatus',
			method: 'post'
		})
	}
}
