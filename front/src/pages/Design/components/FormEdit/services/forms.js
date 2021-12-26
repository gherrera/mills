import apiConfig from '../../../../../config/api'
import { apiRequestorHelper } from '../../../../../helpers'

export default {
	deleteLogo: (id, position) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/deleteLogo/' + id+'/'+position,
			method: 'post'
		})
	},
	changePositionLogo: (id, position, newPosition) => {
		return apiRequestorHelper({
			url: apiConfig.url + '/changePositionLogo/' + id+'/'+position+'/'+newPosition,
			method: 'post'
		})
	}
}
