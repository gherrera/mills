import { formsService } from '../services'

export default (id, dest) => {
 	return new Promise(resolve => {
 		formsService.generateForm(id, dest)
 			.then(response => resolve(response.data))
 	})
}
