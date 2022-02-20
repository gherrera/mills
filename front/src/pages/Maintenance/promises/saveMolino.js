import { ServiceService } from '../services'

export default (molino) => {
  return new Promise((resolve, reject) => {
    ServiceService.saveMolino(molino)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
