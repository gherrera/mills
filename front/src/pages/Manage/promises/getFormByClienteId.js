import { formsService } from '../services'

export default (from, size, params) => {
 	return new Promise(resolve => {
 		formsService.getFormByClienteId(from, size, params)
 			.then(response => resolve(response.data))
 	})
}
