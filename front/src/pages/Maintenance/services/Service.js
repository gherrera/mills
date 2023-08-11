import apiConfig from '../../../config/api'
import { apiRequestorHelper } from '../../../helpers'

export default {
  getMolinos: (status) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getMolinos',
      method: 'post',
      body: {
        status
      }
    })
  },
  getMolino: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getMolino',
      method: 'post',
      body: {
        id
      }
    })
  },
  saveMolino: (molino) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/saveMolino',
      method: 'post',
      body: molino
    })
  },
  getTiposEquipo: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getTiposEquipo',
      method: 'post'
    })
  },
  getTiposPieza: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getTiposPieza',
      method: 'post'
    })
  },
  getPersonas: () => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getPersonas',
      method: 'post'
    })
  },
  uploadConfigTiposEquipo: (formData) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/uploadConfigTiposEquipo',
      method: 'post',
      body: formData,
      headers: {
          'Content-Type': 'multipart/form-data'
      }
    })
  },
  uploadConfigTiposPieza: (formData) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/uploadConfigTiposPieza',
      method: 'post',
      body: formData,
      headers: {
          'Content-Type': 'multipart/form-data'
      }
    })
  },
  uploadConfigPersonal: (formData) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/uploadConfigPersonal',
      method: 'post',
      body: formData,
      headers: {
          'Content-Type': 'multipart/form-data'
      }
    })
  },
  uploadSchedule: (formData) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/uploadSchedule',
      method: 'post',
      body: formData,
      headers: {
          'Content-Type': 'multipart/form-data'
      }
    })
  },
  updatePartTask: (tareaParte) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/updatePartTask',
      method: 'post',
      body: tareaParte
    })
  },
  updateTask: (tarea) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/updateTask',
      method: 'post',
      body: tarea
    })
  },
  updateStage: (stage) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/updateStage',
      method: 'post',
      body: stage
    })
  },
  updateTurnoHistorial: (turno) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/updateTurnoHistorial',
      method: 'post',
      body: turno
    })
  },
  updateEvento: (evento) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/updateEvento',
      method: 'post',
      body: evento
    })
  },
  getActivityByMolino: (id) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/getActivityByMolino',
      method: 'post',
      body: {
        id
      }
    })
  },
  deleteActivity: (idMolino, idActivity) => {
    return apiRequestorHelper({
      url: apiConfig.url + '/deleteActivity',
      method: 'post',
      body: {
        idMolino,
        idActivity
      }
    })
  }
}
