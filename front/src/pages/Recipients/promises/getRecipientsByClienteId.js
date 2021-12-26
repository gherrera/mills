import { recipientsService } from '../services'

export default (from, size, params) => {
 	return new Promise(resolve => {
		recipientsService.getRecipientsByClienteId(from, size, params)
 			.then(response => resolve(response.data))
 	})
}
