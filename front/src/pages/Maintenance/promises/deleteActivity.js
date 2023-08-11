import { ServiceService } from '../services'

export default (idMolino, idActivity) => {
  return new Promise((resolve, reject) => {
    ServiceService.deleteActivity(idMolino, idActivity)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
