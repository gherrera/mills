import { SessionStorageService } from '../services'

export default (authToken) => {
  SessionStorageService.create('authToken', authToken.token)
  SessionStorageService.create('authTokenExpirationDate', authToken.expirationDate)
  SessionStorageService.create('latestApiRequestDate', null)
}
