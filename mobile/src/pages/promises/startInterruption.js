import services from '../services/services'

export default (id, stopFaena, comments) => {
  return new Promise((resolve, reject) => {
    services.startInterruption(id, stopFaena, comments)
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
