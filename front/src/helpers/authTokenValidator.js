import { SessionStorageService } from '../services'

export default async () => {
  return SessionStorageService.read('authToken') ? true : false
}
