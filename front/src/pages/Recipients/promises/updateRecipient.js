import { recipientsService } from '../services'

export default (rec) => {
 	return new Promise(resolve => {
		recipientsService.updateRecipient(rec)
 			.then(response => resolve(response.data))
 	})
}
