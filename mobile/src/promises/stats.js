import { formsService } from '../services'

export default () => {
 	return new Promise(resolve => {
 		formsService.stats()
 			.then(response => resolve(response.data))
 	})
}
