import { formsService } from '../services'

export default (id, comments) => {
 	return new Promise(resolve => {
 		formsService.addComment(id, comments)
 			.then(response => resolve(response.data))
 	})
}
