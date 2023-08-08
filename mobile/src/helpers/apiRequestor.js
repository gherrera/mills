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

  if(args.cfg) {
    config.url = args.cfg.url
    config.method = args.cfg.method
    if(args.cfg.responseType) config.responseType = args.cfg.responseType
    if(args.cfg.data) {
      config.data = args.cfg.data
      if(args.cfg.timestamp) {
        config.data.timestamp = args.cfg.timestamp
      }
    }
  }else {
    config.url = args.url
    config.method = args.method
    config.timestamp = Date.now()

    //console.log(args.url);
    //Alert.alert("URL", args.url)

    if ('responseType' in args) {
      config.responseType = args.responseType
    }

    if ('body' in args) {
      config.data = args.body
    }
  }

  SessionStorageService.update("latestApiRequestDate", new Date().getTime())

  let axiosResult = null;
  if(args.noCall !== true) {
    axiosResult = axios(config)
      .catch(error => {
        console.log("Error de conexion:", error.message)
        if (validateErrors && error.message === 'Network Error') {
        //if (validateErrors) {
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
        } else {
          throw error;
        }
      });
  }
  if(args.getParams === true) return { axiosResult, config };
  else return axiosResult
}
