import { ServiceService } from '../services'

export default () => {
  return new Promise((resolve, reject) => {
    ServiceService.getTiposPieza()
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
