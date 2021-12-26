import generator from 'generate-password'

export default () => {
  const password = generator.generate({
    length: 10,
    numbers: true,
    uppercase: true,
    symbols: false,
    strict: true
  })

  return password
}
