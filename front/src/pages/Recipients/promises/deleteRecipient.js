import { recipientsService } from '../services'

export default (id) => {
 	return new Promise(resolve => {
		recipientsService.deleteRecipient(id)
 			.then(response => resolve(response.data))
 	})
}
