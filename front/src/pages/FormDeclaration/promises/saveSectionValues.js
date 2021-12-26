import { formsService } from '../services'

export default (formId, section) => {
 	return new Promise(resolve => {
 		formsService.saveSectionValues(formId, section)
 			.then(response => resolve(response.data))
 	})
}
