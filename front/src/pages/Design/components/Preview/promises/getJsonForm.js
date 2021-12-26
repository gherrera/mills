import { jsonService } from '../services'

export default (form) => {
 	return new Promise(resolve => {
		jsonService.getJsonForm(form)
 			.then(response => resolve(response.data))
 	})
}
