import services from '../services/services'

export default (id, stopFaena, comments, online) => {
  const req = services.startInterruption(id, stopFaena, comments, online);
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
      resolve(req)
    }
  })
}
