import { ServiceService } from '../services'

export default (formData) => {
  return new Promise((resolve, reject) => {
    ServiceService.uploadSchedule(formData)
    .then(response => resolve(response.data))
    .then(err => reject({ error: true }))
  })
}
