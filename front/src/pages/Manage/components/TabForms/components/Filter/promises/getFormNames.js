import { formsService } from '../services'

export default () => {
 	return new Promise(resolve => {
 		formsService.getFormNames()
 			.then(response => resolve(response.data))
 	})
}
