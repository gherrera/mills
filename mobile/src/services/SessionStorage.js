import SyncStorage from 'sync-storage';

export default {
  create: (key, value) => {
    return SyncStorage.set(key, value)
  },

  read: (key) => {
    return SyncStorage.get(key)
  },

  update: (key, value) => {
    return SyncStorage.set(key, value)
  },

  delete: (key) => {
    return SyncStorage.remove(key)
  }
}
