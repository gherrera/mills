import { SessionStorageService } from '../services'

export default () => {
  return SessionStorageService.read('authToken') ? true : false
}
