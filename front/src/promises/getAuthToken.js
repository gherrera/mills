import { notification } from 'antd'
import { AuthTokenService } from '../services'

export default (username, password) => {
  return new Promise((resolve, reject) => {
    AuthTokenService.create(username, password, new Date().getTime())
      .then(async response => {
        if (response.data.code === 200) {
          resolve({
            token: response.data.token,
            expirationDate: response.data.expirationDate
          })
        } else {
          switch(response.data.msg) {
            case 'INVALID_CREDENTIALS':
              notification['error']({ message: 'Nombre de usuario y/o contraseña incorrectos' })
              resolve({ error: true })
              break

            case 'USER_LOCKED':
              notification['error']({ message: 'Su cuenta ha sido bloqueada, intentelo más tarde.' })
              resolve({ error: true })
              break

            case 'IP_NOT_AUTHORIZED':
              notification['error']({ message: 'IP no autorizada' })
              resolve({ error: true })
              break

            default:
              notification['error']({ message: 'Ha ocurrido un error desconocido, inténtelo más tarde.' })
              resolve({ error: true })
              break
          }
        }
      })
      .catch(err => {
        console.log(err)
      })
  })
}
