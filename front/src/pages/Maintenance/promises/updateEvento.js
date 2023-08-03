import { ServiceService } from '../services'

export default (evento) => {
  return new Promise((resolve, reject) => {
    ServiceService.updateEvento(evento)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
