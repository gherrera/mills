import { formsService } from '../services'

export default (id, position, newPosition) => {
 	return new Promise(resolve => {
 		formsService.changePositionLogo(id, position, newPosition)
 			.then(response => resolve(response.data))
 	})
}
