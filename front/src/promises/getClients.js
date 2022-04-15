import { UsersService } from '../services'

export default () => {
  return new Promise((resolve, reject) => {
    UsersService.getClients()
      .then(response => resolve(response.data))
      .catch(err => console.log(err))
  })
}
