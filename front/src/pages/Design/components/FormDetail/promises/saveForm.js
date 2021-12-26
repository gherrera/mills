import { formsService } from '../services'

export default (form) => {
 	return new Promise(resolve => {
 		formsService.saveForm(form)
 			.then(response => resolve(response.data))
 	})
}
