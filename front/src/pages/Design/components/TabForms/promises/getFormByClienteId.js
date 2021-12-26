import { formsService } from '../services'

export default (from, size) => {
 	return new Promise(resolve => {
 		formsService.getFormByClienteId(from, size)
 			.then(response => resolve(response.data))
 	})
}
