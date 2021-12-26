import { formsService } from '../services'

export default (id) => {
 	return new Promise(resolve => {
 		formsService.getFormHash(id)
 			.then(response => resolve(response.data))
 	})
}
