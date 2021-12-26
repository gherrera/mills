import { recipientsService } from '../services'

export default (id, comments) => {
 	return new Promise(resolve => {
		recipientsService.addComment(id, comments)
 			.then(response => resolve(response.data))
 	})
}
