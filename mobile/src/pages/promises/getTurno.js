import services from '../services/services'

export default (id, validateErrors=true) => {
  return new Promise((resolve, reject) => {
    services.getTurno(id, validateErrors)
      .then(response => resolve(response.data))
      .catch(err => resolve({ error: true }))
  })
}
