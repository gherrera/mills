import services from '../services/services'

export default (id) => {
  return new Promise((resolve, reject) => {
    services.finishTask(id)
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
