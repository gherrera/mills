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
  startTask: (id, stage) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/startTask',
      method: 'post',
      body: {
        id,
        stage
      }
    })
  },
  finishTask: (id, stage) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/finishTask',
      method: 'post',
      body: {
        id,
        stage
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
  finishEtapa: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/finishEtapa',
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
  },
  startInterruption: (id, desc) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/startInterruption',
      method: 'post',
      body: {
        id,
        desc
      }
    })
  },
  finishInterruption: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/finishInterruption',
      method: 'post',
      body: {
        id
      }
    })
  }
}
