export default {
  create: (key, value) => {
    return window.sessionStorage.setItem(key, value)
  },

  read: (key) => {
    return window.sessionStorage.getItem(key)
  },

  update: (key, value) => {
    return window.sessionStorage.setItem(key, value)
  },

  delete: (key) => {
    return window.sessionStorage.removeItem(key)
  }
}
