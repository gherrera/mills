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
  inicioTurno: (id, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/inicioTurno',
      method: 'post',
      body: {
        id
      },
      getParams: true,
      noCall: !online
    })
  },
  finTurno: (id, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/finTurno',
      method: 'post',
      body: {
        id
      },
      getParams: true,
      noCall: !online
    })
  },
  startTask: (id, stage, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/startTask1',
      method: 'post',
      body: {
        id,
        stage
      },
      getParams: true,
      noCall: !online
    })
  },
  finishTask: (id, stage, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/finishTask',
      method: 'post',
      body: {
        id,
        stage
      },
      getParams: true,
      noCall: !online
    })
  },
  startEtapa: (id, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/startEtapa',
      method: 'post',
      body: {
        id
      },
      getParams: true,
      noCall: !online
    })
  },
  finishEtapa: (id, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/finishEtapa',
      method: 'post',
      body: {
        id
      },
      getParams: true,
      noCall: !online
    })
  },
  addParte: (id, stage, parteId, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/addParte',
      method: 'post',
      body: {
        id,
        stage,
        parteId
      },
      getParams: true,
      noCall: !online
    })
  },
  startInterruption: (id, stopFaena, comments, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/startInterruption',
      method: 'post',
      body: {
        id,
        stopFaena,
        comments
      },
      getParams: true,
      noCall: !online
    })
  },
  finishInterruption: (id, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/finishInterruption',
      method: 'post',
      body: {
        id
      },
      getParams: true,
      noCall: !online
    })
  }
}
