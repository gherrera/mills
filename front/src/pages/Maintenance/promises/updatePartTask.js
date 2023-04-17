import { ServiceService } from '../services'

export default (tareaParte) => {
  return new Promise((resolve, reject) => {
    ServiceService.updatePartTask(tareaParte)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
