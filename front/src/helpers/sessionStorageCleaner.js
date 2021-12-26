import { SessionStorageService } from '../services'

export default async () => {
  await SessionStorageService.delete('authToken')
  await SessionStorageService.delete('latestApiRequestDate')
  await SessionStorageService.delete('authTokenExpirationDate')
  await SessionStorageService.delete('latest_Query')
  await SessionStorageService.delete('latest_QueryId')
  await SessionStorageService.delete('latest_QueryResultsFromNum')
  await SessionStorageService.delete('latest_QueryResultsTotalNum')
  await SessionStorageService.delete('latest_QueryResultsCurrentPage')
}
