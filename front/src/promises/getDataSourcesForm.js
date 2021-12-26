import { DataSourcesService } from '../services'

export default (formId) => {
  return new Promise((resolve, reject) => {
    DataSourcesService.form(formId)
      .then(response => resolve(response.data))
      .catch(err => console.log(err))
  })
}
