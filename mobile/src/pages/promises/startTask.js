import services from '../services/services'

export default (id, stage) => {
  return new Promise((resolve, reject) => {
    services.startTask(id, stage)
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
