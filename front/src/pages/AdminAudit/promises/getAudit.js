import { AuditService } from '../services'

export default (fromNum, resultsPerPage, filters) => {
  return new Promise(async (resolve, reject) => {
    await AuditService.read(fromNum, resultsPerPage, filters)
      .then(response => resolve(response.data))
      .then(err => reject({ error: true }))
  })
}
