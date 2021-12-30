import services from '../services/services'

export default () => {
  return new Promise((resolve, reject) => {
    services.getTurnosActivos()
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
