const generatePass = () => {
  let password = ''
  const str =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$'

  for (let i = 1; i <= 8; i++) {
    const char = Math.floor(Math.random() * str.length + 1)
    password += str.charAt(char)
  }

  return password
}

const generateSecret = () => {
  let secret = ''
  const str =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$'

  for (let i = 1; i <= 15; i++) {
    const char = Math.floor(Math.random() * str.length + 1)
    secret += str.charAt(char)
  }

  return secret
}

export { generatePass, generateSecret }
