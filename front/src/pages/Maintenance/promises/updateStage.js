import { ServiceService } from '../services'

export default (stage) => {
  return new Promise((resolve, reject) => {
    ServiceService.updateStage(stage)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
