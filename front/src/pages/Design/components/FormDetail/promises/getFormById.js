import { formsService } from '../services'

export default (id) => {
 	return new Promise(resolve => {
 		formsService.getFormById(id)
 			.then(response => resolve(response.data))
 	})
}
