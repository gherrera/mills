import { formsService } from '../services'

export default (id) => {
 	return new Promise(resolve => {
 		formsService.getB64Form(id)
 			.then(response => resolve(response.data))
 	})
}
