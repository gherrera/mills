import { formsService } from '../services'

export default (formId) => {
 	return new Promise(resolve => {
 		formsService.sendForm(formId)
 			.then(response => resolve(response.data))
 	})
}
