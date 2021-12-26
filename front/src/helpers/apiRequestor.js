import axios from 'axios'
import { SessionStorageService } from '../services'

export default (args, validateErrors=true) => {
  const config = {}
  const authToken = SessionStorageService.read('authToken')

  config.headers = {}
  if (authToken) {
    config.headers['Authorization'] = 'Bearer ' + authToken
  }
  if ('headers' in args) {
    for (let key in args.headers) {
      config.headers[key] = args.headers[key]
    }
  }

  config.url = args.url
  config.method = args.method

  if ('responseType' in args) {
    config.responseType = args.responseType
  }

  if ('body' in args) {
    config.data = args.body
  }

  SessionStorageService.update('latestApiRequestDate', new Date().getTime())

  return axios(config).catch(error => {
    if (validateErrors && error.message === 'Network Error') {
      SessionStorageService.delete('authToken')
      SessionStorageService.delete('latestApiRequestDate')
      SessionStorageService.delete('authTokenExpirationDate')
      SessionStorageService.delete('latest_Query')
      SessionStorageService.delete('latest_QueryId')
      SessionStorageService.delete('latest_QueryResultsFromNum')
      SessionStorageService.delete('latest_QueryResultsTotalNum')
      SessionStorageService.delete('latest_QueryResultsCurrentPage')

      window.location.reload()
    }
  })
}
