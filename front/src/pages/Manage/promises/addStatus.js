import { formsService } from '../services'

export default (id, status) => {
 	return new Promise(resolve => {
 		formsService.addStatus(id, status)
 			.then(response => resolve(response.data))
 	})
}
