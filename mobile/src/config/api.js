const api = {}

if ( process.env.REACT_APP_ENV === 'prod') {
  api.url = 'https://api.formularia.net/api'
}else if(process.env.REACT_APP_ENV === 'qa') {
  api.url = 'https://api.formularia.net/api'
}else {
  //api.url = 'https://api-docs.gesintel.cl/app/api'
  api.url = 'http://192.168.100.11:5000/api'
}
export default api
