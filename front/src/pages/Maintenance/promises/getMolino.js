import { ServiceService } from '../services'

export default (id) => {
  return new Promise((resolve, reject) => {
    ServiceService.getMolino(id)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
