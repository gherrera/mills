import { recipientsService } from '../services'

export default (id) => {
 	return new Promise(resolve => {
		recipientsService.getRecipientById(id)
 			.then(response => resolve(response.data))
 	})
}
