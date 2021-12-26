export default () => {
  return new Promise(resolve => {
    window.setTimeout(() => {
      const content = document.getElementById('content')

      content.className = ''

      resolve()
    }, 1000)
  })
}
