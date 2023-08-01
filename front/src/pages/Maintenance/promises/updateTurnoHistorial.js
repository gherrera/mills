import { ServiceService } from '../services'

export default (turno) => {
  return new Promise((resolve, reject) => {
    ServiceService.updateTurnoHistorial(turno)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
