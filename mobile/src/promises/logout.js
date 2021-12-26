import { UserService } from '../services'

export default () => {
  return new Promise((resolve, reject) => {
    UserService.logout()
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
