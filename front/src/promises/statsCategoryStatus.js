import { formsService } from '../services'

export default () => {
 	return new Promise(resolve => {
 		formsService.statsCategoryStatus()
 			.then(response => resolve(response.data))
 	})
}
