import services from '../services/services'

export default (id) => {
  return new Promise((resolve, reject) => {
    services.getTurno(id)
      .then(response => resolve(response.data))
      .catch(err => reject(err))
  })
}
