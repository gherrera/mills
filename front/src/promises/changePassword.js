import { notification } from 'antd'
import { UserService } from '../services'
import i18nextConfig from '../config/i18next'

export default (passwordCurrent, passwordNew, passwordNewConfirm) => {
  return new Promise(async resolve => {
    if (passwordNew !== passwordNewConfirm) {
      notification['error']({ message: i18nextConfig.t('messages.aml.errors.passwordsDontMatch') })
    } else {
      await UserService.changePwd(passwordCurrent, passwordNew)
        .then(response => {
          if (response.data.status === 'OK') {
            notification['success']({ message: i18nextConfig.t('messages.aml.success.passwordSuccesfullyUpdated') })

            resolve()
          } else {
            switch(response.data.detail) {
              case 'BAD_CREDENTIALS':
                notification['error']({ message: i18nextConfig.t('messages.aml.errors.passwordIsWrong') })
                break
              case 'Clave no puede estar contenida en el login':
                notification['error']({ message: i18nextConfig.t('messages.aml.errors.passwordCannotBeInLogin') })
                break
              case 'No puede usar claves anteriores':
                notification['error']({ message: i18nextConfig.t('messages.aml.errors.youCannotUsePreviousPasswords') })
                break
              case 'Clave debe tener entre 8-20 caracteres':
                notification['error']({ message: i18nextConfig.t('messages.aml.errors.passwordMustHaveBetween8and20Chars') })
                break
              case 'Clave debe ser Alfanumerica':
                notification['error']({ message: i18nextConfig.t('messages.aml.errors.passwordMustBeAlphanumeric')})
                break
              case 'Clave debe contener minuscula':
                notification['error']({ message: i18nextConfig.t('messages.aml.errors.passwordMustHaveLowerCaseLetter') })
                break
              case 'Clave debe contener mayuscula':
                notification['error']({ message: i18nextConfig.t('messages.aml.errors.passwordMustHaveUpperCaseLetter') })
                break
              default:
                notification['error']({ message: i18nextConfig.t('messages.aml.errors.unknownError') })
                break
            }
          }
        })
        .catch(err => console.log(err))
    }
  })
}
