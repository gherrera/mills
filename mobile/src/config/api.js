const api = {}

if ( process.env.REACT_APP_ENV === 'prod') {
  api.url = 'https://mills.formularia.net/api'
}else if(process.env.REACT_APP_ENV === 'qa') {
  api.url = 'https://mills.formularia.net/api'
}else {
  api.url = 'https://mills.formularia.net/api'
  //api.url = 'http://192.168.100.11:5000/api'
}
api.env = "prod"
export default api
