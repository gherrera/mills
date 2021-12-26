import { formsService } from '../services'

export default () => {
 	return new Promise(resolve => {
 		formsService.statsCategory()
 			.then(response => resolve(response.data))
 	})
}
