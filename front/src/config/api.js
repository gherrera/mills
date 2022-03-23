const api = {}

if ( process.env.REACT_APP_ENV === 'prod') {
  api.url = 'https://api.millssystem.net/api'
}else if(process.env.REACT_APP_ENV === 'qa') {
  api.url = 'https://api.millssystem.net/api'
}else {
  api.url = 'https://api.millssystem.net/api'
  //api.url = 'http://localhost:5000/api'
}
export default api
