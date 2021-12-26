import { sectionEditService } from '../services'

export default (formId, origin, datasource) => {
 	return new Promise(resolve => {
		sectionEditService.saveDS(formId, origin, datasource)
 			.then(response => resolve(response.data))
 	})
}
