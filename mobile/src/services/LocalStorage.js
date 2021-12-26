export default {
  create: (key, value) => {
    return window.localStorage.setItem(key, value)
  },

  read: (key) => {
    return window.localStorage.getItem(key)
  },

  update: (key, value) => {
    return window.localStorage.setItem(key, value)
  },

  delete: (key) => {
    return window.localStorage.removeItem(key)
  }
}
