import { formsService } from '../services'

export default (id, position) => {
 	return new Promise(resolve => {
 		formsService.deleteLogo(id, position)
 			.then(response => resolve(response.data))
 	})
}
