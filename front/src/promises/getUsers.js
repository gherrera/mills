import { UsersService } from '../services'

export default () => {
  return new Promise((resolve, reject) => {
    UsersService.read()
      .then(response => resolve(response.data.records))
      .catch(err => console.log(err))
  })
}
