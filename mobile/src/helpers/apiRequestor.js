import axios from 'axios'
import { Alert } from 'react-native'
import { SessionStorageService } from '../services'
import RNRestart from 'react-native-restart';

export default (args, validateErrors=true) => {
  const config = {}
  const authToken = SessionStorageService.read('authToken')

  config.headers = {}
  //console.log('authToken: '+authToken)
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

  console.log(args.url);

  if ('responseType' in args) {
    config.responseType = args.responseType
  }

  if ('body' in args) {
    config.data = args.body
  }

  SessionStorageService.update("latestApiRequestDate", new Date().getTime())

  return axios(config).catch(error => {
    console.error(error)
    //if (validateErrors && error.message === 'Network Error') {
    if (validateErrors) {
      SessionStorageService.delete('authToken')
      SessionStorageService.delete('latestApiRequestDate')
      SessionStorageService.delete('authTokenExpirationDate')
      SessionStorageService.delete('latest_Query')
      SessionStorageService.delete('latest_QueryId')
      SessionStorageService.delete('latest_QueryResultsFromNum')
      SessionStorageService.delete('latest_QueryResultsTotalNum')
      SessionStorageService.delete('latest_QueryResultsCurrentPage')

      Alert.alert("Error", "Sesión expirada")
      RNRestart.Restart();
    }
  })
}
