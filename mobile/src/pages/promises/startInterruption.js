import services from '../services/services'

export default (id, desc) => {
  return new Promise((resolve, reject) => {
    services.startInterruption(id, desc)
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
