import { DataSourcesService } from '../services'

export default () => {
  return new Promise((resolve, reject) => {
    DataSourcesService.catalogo()
      .then(response => resolve(response.data))
      .catch(err => console.log(err))
  })
}
