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
    }, false)
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
    }, false)
  },
  startTask: (id, stage, online) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/mobile/startTask',
      method: 'post',
      body: {
        id,
        stage
      },
      getParams: true,
      noCall: !online
    }, false)
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
    }, false)
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
    }, false)
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
    }, false)
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
    }, false)
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
    }, false)
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
    }, false)
  }
}
