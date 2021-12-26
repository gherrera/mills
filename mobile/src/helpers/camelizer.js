export default (str) => {
  if(str !== null && str !== undefined) {
    return str.split(' ').map(function(word,index){
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }).join(' ')
  }
}
