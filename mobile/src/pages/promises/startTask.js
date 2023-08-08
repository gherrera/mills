import services from '../services/services'

export default (id, stage, online) => {
  const req = services.startTask(id, stage, online);
  return new Promise((resolve, reject) => {
    if(req.axiosResult) {
      req.axiosResult
        .then(response => {
          resolve({data: response.data, config: req.config})
        })
        .catch(err => {
          reject({ err, config: req.config })
        })
    }else {
      resolve({ config: req.config })
    }
  })
}
