import { formsService } from '../services'

export default (hash) => {
 	return new Promise(resolve => {
 		formsService.getFormHash(hash)
 			.then(response => resolve(response.data))
 	})
}
