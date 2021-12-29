import { UserService } from '../services'

export default (username) => {
  return new Promise((resolve, reject) => {
    UserService.forgotPwd(username)
      .then(response => resolve(response.data))
      .catch(err => reject({ error: true }))
  })
}
