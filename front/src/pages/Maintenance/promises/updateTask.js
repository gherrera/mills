import { ServiceService } from '../services'

export default (tarea) => {
  return new Promise((resolve, reject) => {
    ServiceService.updateTask(tarea)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
