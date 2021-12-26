export default () => {
  return new Promise(resolve => {
    const header = document.getElementById('header')
    const content = document.getElementById('content')
    const breadcrumbs = document.getElementsByClassName('breadcrumbs')

    header.className += ' logout-animation'
    content.className += ' logout-animation'

    for (let i = 0; i < breadcrumbs.length; i++) {
      breadcrumbs[i].className += ' logout-animation'
    }

    setTimeout(() => {
      resolve()
    }, 350)
  })
}
