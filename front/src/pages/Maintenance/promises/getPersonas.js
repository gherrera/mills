import { ServiceService } from '../services'

export default () => {
  return new Promise((resolve, reject) => {
    ServiceService.getPersonas()
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
