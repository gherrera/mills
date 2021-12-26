import { jsonService } from '../services'

export default (section) => {
 	return new Promise(resolve => {
		jsonService.getJsonSection(section)
 			.then(response => resolve(response.data))
 	})
}
