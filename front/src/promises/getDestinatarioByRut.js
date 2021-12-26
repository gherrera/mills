import { formsService } from '../services'

export default (clienteId, rut) => {
 	return new Promise(resolve => {
 		formsService.getDestinatarioByRut(clienteId, rut)
 			.then(response => resolve(response.data))
 	})
}
