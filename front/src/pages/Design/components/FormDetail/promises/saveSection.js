import { formsService } from '../services'

export default (section) => {
 	return new Promise(resolve => {
 		formsService.saveSection(section)
 			.then(response => resolve(response.data))
 	})
}
