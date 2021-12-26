import { UserService } from '../services'

export default () => {
  return new Promise((resolve, reject) => {
    UserService.read()
      .then(response => resolve(response.data.user))
      .catch(err => reject({ error: true }))
  })
}
