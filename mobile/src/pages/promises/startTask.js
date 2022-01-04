import services from '../services/services'

export default (id) => {
  return new Promise((resolve, reject) => {
    services.startTask(id)
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
