import services from '../services/services'

export default (id, stage, parteId) => {
  return new Promise((resolve, reject) => {
    services.addParte(id, stage, parteId)
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
