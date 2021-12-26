import apiConfig from '../config/api'
import { apiRequestorHelper } from '../helpers'

export default {
  read: (endpoint, body, headers, fileName) => {
    return apiRequestorHelper({
      url: apiConfig.url + endpoint,
      method: 'post',
      body,
      headers,
      responseType: 'blob'
    }).then((response) => {
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', fileName); //or any other extension
       document.body.appendChild(link);
       link.click();
    });
  }
}
