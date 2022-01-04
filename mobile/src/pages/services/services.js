import apiConfig from '../../config/api'
import { apiRequestorHelper } from '../../helpers'

export default {
  getTurnosActivos: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getTurnosActivosController',
      method: 'post'
    })
  },
  getTurno: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getTurno',
      method: 'post',
      body: {
        id
      }
    })
  },
  inicioTurno: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/inicioTurno',
      method: 'post',
      body: {
        id
      }
    })
  },
  finTurno: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/finTurno',
      method: 'post',
      body: {
        id
      }
    })
  },
  startTask: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/startTask',
      method: 'post',
      body: {
        id
      }
    })
  },
  finishTask: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/finishTask',
      method: 'post',
      body: {
        id
      }
    })
  },
  startEtapa: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/startEtapa',
      method: 'post',
      body: {
        id
      }
    })
  },
  addParte: (id, stage, parteId) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/addParte',
      method: 'post',
      body: {
        id,
        stage,
        parteId
      }
    })
  }
}
