import { formsService } from '../services'

export default (form) => {
 	return new Promise(resolve => {
 		formsService.updateForm(form)
 			.then(response => resolve(response.data))
 	})
}
