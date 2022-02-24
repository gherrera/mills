import { ServiceService } from '../services'

export default (status) => {
  return new Promise((resolve, reject) => {
    ServiceService.getMolinos(status)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
